# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

VERDAD is a platform for detecting and analyzing potential disinformation in Spanish-language radio broadcasts. This frontend repo provides an interface for journalists/researchers to review AI-flagged audio snippets, add labels, discuss via comments, and provide feedback.

**Related repo**: [verdad](https://github.com/publicdataworks/verdad) - Python backend with 5-stage AI processing pipeline:
1. Initial disinformation detection (Gemini Flash)
2. Audio clipping
3. In-depth analysis (Gemini Pro)
4. Analysis review
5. Embedding generation (for vector similarity search)

The backend is orchestrated by Prefect on Fly.io. Audio stored in Cloudflare R2. The Express server in the backend **only** handles Liveblocks auth (for real-time collaboration) - all data operations go through Supabase RPC.

## Local Development Setup

1. Clone and install:
   ```bash
   git clone git@github.com:publicdataworks/verdad-frontend.git
   cd verdad-frontend
   npm install
   npm run prepare  # Install husky pre-commit hooks
   ```

2. Create `.env` file with required variables:
   ```
   VITE_SUPABASE_URL=<supabase-project-url>
   VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
   VITE_BASE_URL=<backend-server-url>
   VITE_AUTH_REDIRECT_URL=/search
   VITE_AUDIO_BASE_URL=<cloudflare-r2-audio-url>
   ```

3. For E2E tests, copy `cypress.env.json.sample` to `cypress.env.json`

4. Start dev server: `npm run dev` → opens at http://0.0.0.0:5173

## Commands
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run prettier` - Format all files
- `npm run test:unit` - Run Vitest (add `-- --watch` for watch mode)
- `npm run cy:open` / `npm run cy:run` - Cypress E2E tests

## Architecture Overview

### Provider Hierarchy (App.tsx)
The app wraps components in this order (outermost to innermost):
`QueryClientProvider → ThemeProvider → TooltipProvider → AuthProvider → AudioProvider → SidebarProvider → LanguageProvider → Router`

### Data Flow
- **Supabase RPC functions** are the primary data source (not REST endpoints)
- API calls in `src/apis/` call Supabase RPC directly via `supabase.rpc()`
- React Query manages caching/state with keys defined in hooks (e.g., `snippetKeys` in `useSnippets.tsx`)
- Filter state syncs with URL search params via `useSnippetFilters` hook

### Key Patterns
- **Authenticated routes**: Wrapped in `AuthenticatedLayout` which handles session checks and redirects, also initializes Liveblocks for real-time collaboration
- **Public routes**: `/p/:snippetId` for shareable snippet links, `/login`, `/signup`, landing page
- **Snippets**: Core data model with preview/detail separation - `get_snippets_preview` for list, `get_snippet_details` for full data
- **Path aliases**: `@/` maps to `src/` (configured in vite.config.ts)

### Database & Backend Integration
- SQL functions in `supabase/database/sql/`, migrations in `supabase/migrations/`
- Key Supabase RPC functions: `get_snippets_preview`, `get_snippet_details`, `search_related_snippets_public`, `like_snippet`, `toggle_star_snippet`, `hide_snippet`
- Liveblocks auth endpoint: `VITE_BASE_URL/api/liveblocks-auth` (handled by Express server in backend repo)
- Audio files served from Cloudflare R2 via `file_path` URLs in snippet data

### Core Data Model
- **audio_files**: Raw radio recordings (5-15 min each)
- **stage_1_llm_responses**: Initial AI detection results
- **snippets**: Flagged clips with transcription, translation, labels, confidence scores, political leaning, etc.

## Code Style
- TypeScript with strict typing, React functional components only
- Prettier: single quotes, no semicolons, 120 char width, no trailing commas
- Import order: React → external packages → internal (`@/components`, `@/hooks`, `@/utils`)