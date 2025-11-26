// Recording types for the Recording Browser feature

export interface RecordingPreview {
  id: string
  radio_station_name: string
  radio_station_code: string
  location_state: string | null
  location_city: string | null
  recorded_at: string
  recording_day_of_week: string
  file_path: string
  file_size: number
  status: 'New' | 'Processing' | 'Processed' | 'Error' | 'Ready for review' | 'Reviewing'
  starred: boolean
  snippet_count: number
  has_snippets: boolean
  primary_language: string
}

export interface RecordingTranscript {
  initial_transcription: string | null
  timestamped_transcription: {
    timestamped_transcription: string
  } | null
  transcriptor: string | null
}

export interface TranscriptSegment {
  timestamp: string
  text: string
}

export interface DerivedSnippetLabel {
  id: string
  text: string
}

export interface DerivedSnippet {
  id: string
  title: string
  summary: string
  start_time: string
  end_time: string
  duration: string
  file_path: string
  transcription: string | null
  translation: string | null
  confidence_scores: {
    overall: number
    categories: Array<{ score: number; category: string }>
  } | null
  language: {
    primary_language: string
    dialect?: string
    register?: string
  } | null
  labels: DerivedSnippetLabel[]
}

export interface RecordingDetail extends RecordingPreview {
  created_at: string
  transcript: RecordingTranscript
  snippets: DerivedSnippet[]
}

export interface RecordingsResponse {
  recordings: RecordingPreview[]
  next_cursor: string | null
  has_more: boolean
}

export interface RecordingFilterOptions {
  states: string[]
  radio_stations: Array<{ name: string; code: string }>
  languages: string[]
  labels: Array<{ id: string; text: string; text_spanish: string | null }>
}

export interface RecordingFilters {
  state?: string
  radio_station?: string
  has_snippets?: 'all' | 'with' | 'without'
  starred?: boolean
  label?: string
  language?: string
}

export interface ToggleStarResponse {
  success: boolean
  starred?: boolean
  recording_id?: string
  error?: string
}
