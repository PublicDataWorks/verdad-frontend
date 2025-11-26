# Recording Browser Feature - Implementation Plan

## Overview

A new tool for browsing, filtering, and full-text searching all raw radio recordings and their transcripts. Unlike the existing snippet viewer (which shows AI-flagged clips with analysis), this recording browser displays the full unanalyzed audio files and their raw transcriptions, while also showing any snippets that were derived from each recording.

## Access Model

**No authentication required.** This is an internal tool without user accounts:
- No login/signup needed
- No commenting features (unlike snippet viewer)
- All features work anonymously
- Simpler architecture - no Liveblocks, no user-specific state

## Key Features

### Share Button
- One-click copy of direct link to recording detail page
- URL format: `/recordings/:recordingId`
- Toast notification confirms "Link copied to clipboard"

### Global Starring
Unlike the snippet viewer's per-user starring, recording stars are **global/shared**:
- Any user can star or unstar a recording
- All users see the same star status (not personalized)
- Starred recordings can be filtered in the list view
- Simple toggle - no user tracking needed
- Database: single `starred` boolean column on `audio_files` table (or new `recording_stars` table with just `recording_id` and `starred_at`)

## Visual Design Concept

**Key differentiator**: Recordings that contain snippets should be visually distinct:
- **List/Card view**: Full background highlight (e.g., subtle amber/yellow tint) for recording rows/cards that have associated snippets
- **Detail page**: Entire page background tint for recordings with snippets
- This creates an immediate visual signal: "this recording had something flagged"

## Data Model

### Existing Tables Used
```
audio_files
├── id, radio_station_name, radio_station_code
├── location_state, location_city, recorded_at
├── file_path, file_size, status
└── recording_day_of_week

stage_1_llm_responses (1:1 with audio_files)
├── audio_file (FK)
├── initial_transcription (text - raw transcript)
├── timestamped_transcription (jsonb - with timestamps)
└── detection_result (jsonb)

snippets (many:1 with audio_files)
├── audio_file (FK)
├── start_time, end_time, duration
├── transcription, translation, title, summary
└── labels (via snippet_labels join)
```

### New RPC Functions Needed

1. **`get_recordings_preview`** - Paginated list with filters
   - Returns: id, radio_station_*, location_*, recorded_at, file_path, duration, snippet_count, has_snippets
   - Filters: state, radio_station, language, has_snippets (boolean), label (of any snippet), full-text search
   - Ordering: recorded_at (default), snippet_count

2. **`get_recording_details`** - Full recording with transcript and snippets
   - Returns: all audio_file fields + full transcript + array of derived snippets (with their labels)

3. **`toggle_recording_star`** - Toggle global star status
   - Input: recording_id
   - Returns: new starred status (boolean)
   - No auth required - anonymous operation

4. **`search_recordings_fulltext`** - Full-text search on transcripts
   - Search `stage_1_llm_responses.initial_transcription` (original language)
   - Also search translated/English text if available
   - Return matching recordings with highlighted excerpts

## Frontend Components

### Routes
```
/recordings                    - Recording browser (list view)
/recordings/:recordingId       - Recording detail page
```

### New Components

1. **`RecordingBrowser.tsx`** (page)
   - Filter sidebar (reuse/adapt existing `FilterList.tsx` pattern)
   - Recording list with infinite scroll
   - Search box for full-text search

2. **`RecordingCard.tsx`** or **`RecordingRow.tsx`**
   - Displays: station, location, date/time, duration
   - Shows snippet count badge
   - **Background color differs based on `has_snippets`**
   - Star toggle icon (global, not per-user)
   - Click navigates to detail page

3. **`RecordingShareButton.tsx`**
   - Copy link button with clipboard API
   - Shows toast on successful copy
   - Can be used in both card and detail views

4. **`RecordingStarToggle.tsx`**
   - Star/unstar icon button
   - Optimistic UI update
   - Mutates via `toggle_recording_star` RPC
   - Shows filled star when starred, outline when not

5. **`RecordingDetail.tsx`** (page)
   - **Background tint if has snippets**
   - Header with share button + star toggle
   - Audio player (full recording)
   - Full transcript display (scrollable, with timestamps)
   - List of derived snippets (clickable, links to existing snippet viewer)

6. **`RecordingFilters.tsx`** (or extend existing)
   - State/region filter
   - Radio station filter
   - Language filter (Spanish, Arabic, etc.)
   - **Has snippets toggle** (All / With Snippets / Without Snippets)
   - **Starred filter** (All / Starred only)
   - Label/category filter (filters by labels on any derived snippet)
   - Date range picker

7. **`RecordingTranscript.tsx`**
   - Displays timestamped transcript
   - Highlights search terms if active
   - Optionally highlights sections that became snippets

8. **`DerivedSnippets.tsx`**
   - List of snippets extracted from this recording
   - Shows snippet title, time range, labels
   - Links to full snippet detail view

### Hooks

1. **`useRecordings.tsx`**
   - `useRecordings()` - infinite query for paginated list
   - `useRecordingDetails(id)` - single recording with transcript + snippets
   - `recordingKeys` - React Query cache keys

2. **`useRecordingFilters.tsx`**
   - Mirror pattern of `useSnippetFilters.tsx`
   - Syncs filters to URL params

### API Layer

1. **`src/apis/recording.ts`**
   - `fetchRecordingPreviews()` - calls `get_recordings_preview` RPC
   - `fetchRecordingDetails()` - calls `get_recording_details` RPC
   - `toggleRecordingStar()` - calls `toggle_recording_star` RPC
   - `searchRecordings()` - calls `search_recordings_fulltext` RPC

### Types

1. **`src/types/recording.ts`**
   ```typescript
   interface Recording {
     id: string
     radio_station_name: string
     radio_station_code: string
     location_state: string
     location_city: string | null
     recorded_at: string
     recording_day_of_week: string
     file_path: string
     file_size: number
     status: 'New' | 'Processing' | 'Processed' | 'Error'
     snippet_count: number
     has_snippets: boolean
     starred: boolean  // global star status
   }

   interface RecordingDetail extends Recording {
     transcript: TranscriptSegment[]
     snippets: DerivedSnippet[]
   }

   interface TranscriptSegment {
     start_time: string
     end_time: string
     text: string
     text_en?: string  // if translation available
   }

   interface DerivedSnippet {
     id: string
     title: string
     start_time: string
     end_time: string
     labels: { text: string }[]
   }
   ```

## Implementation Phases

### Phase 1: Database Layer
1. Add `starred` boolean column to `audio_files` table (or create simple `recording_stars` table)
2. Create `get_recordings_preview` RPC function
3. Create `get_recording_details` RPC function
4. Create `toggle_recording_star` RPC function (no auth required)
5. Add full-text search indexes on `stage_1_llm_responses.initial_transcription`
6. Create `search_recordings_fulltext` RPC function
7. Write migrations

### Phase 2: Frontend Foundation
1. Add routes to `App.tsx`
2. Create types in `src/types/recording.ts`
3. Create API functions in `src/apis/recording.ts`
4. Create hooks in `src/hooks/useRecordings.tsx` and `useRecordingFilters.tsx`

### Phase 3: List View
1. Build `RecordingBrowser.tsx` page
2. Build `RecordingCard.tsx` with conditional background styling
3. Build `RecordingStarToggle.tsx` and `RecordingShareButton.tsx`
4. Implement `RecordingFilters.tsx` with "has snippets" and "starred" toggles
5. Wire up infinite scroll

### Phase 4: Detail View
1. Build `RecordingDetail.tsx` page with background tint logic
2. Build `RecordingTranscript.tsx` for displaying full transcript
3. Build `DerivedSnippets.tsx` for listing snippets
4. Integrate audio player

### Phase 5: Search & Polish
1. Implement full-text search UI
2. Add search result highlighting in transcript
3. Add loading states and error handling
4. Performance optimization

## Styling Notes

### Background Colors for "Has Snippets" Indication

```css
/* Card/Row - subtle highlight */
.recording-card--has-snippets {
  @apply bg-amber-50 dark:bg-amber-950/30;
}

/* Detail page - full background */
.recording-detail--has-snippets {
  @apply bg-amber-50/50 dark:bg-amber-950/20;
}

/* Or use a left border accent instead/additionally */
.recording-card--has-snippets {
  @apply border-l-4 border-l-amber-500;
}
```

### Filter Options Structure
```typescript
const hasSnippetsOptions = [
  { value: 'all', label: 'All Recordings' },
  { value: 'with', label: 'With Snippets' },
  { value: 'without', label: 'Without Snippets' }
]
```

## Open Questions

1. **Language filter**: Filter by detected primary language or show language toggle like snippets?
2. **Transcript format**: Display as continuous text or time-segmented blocks?
3. **Search scope**: Search only original language, only English, or both?
4. **Performance**: How many recordings exist? May need cursor-based pagination vs offset.

## Resolved Decisions

- **Authentication**: No auth required - anonymous access for all features
- **Starring**: Global (shared) star status, not per-user
- **Comments**: Not included - keeps it simple without user accounts
