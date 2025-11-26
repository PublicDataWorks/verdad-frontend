SET search_path = public, "$user";

-- Add starred column to audio_files for global starring feature
-- This is a global star (not per-user) - anyone can star/unstar and all users see the same status
ALTER TABLE audio_files ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT FALSE;

-- Index for filtering by starred status
CREATE INDEX IF NOT EXISTS idx_audio_files_starred
ON audio_files (starred) WHERE starred = TRUE;

-- Index for sorting by recorded_at (for infinite scroll)
CREATE INDEX IF NOT EXISTS idx_audio_files_recorded_at
ON audio_files (recorded_at DESC);

-- Index for location_state filtering
CREATE INDEX IF NOT EXISTS idx_audio_files_location_state
ON audio_files (location_state);

-- Index for radio_station_name filtering
CREATE INDEX IF NOT EXISTS idx_audio_files_radio_station
ON audio_files (radio_station_name);

-- Full-text search index on initial_transcription in stage_1_llm_responses
-- Using GIN index with pg_trgm for partial matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_stage1_initial_transcription_trgm
ON stage_1_llm_responses USING GIN (initial_transcription gin_trgm_ops);

-- Index for joining audio_files with stage_1_llm_responses
CREATE INDEX IF NOT EXISTS idx_stage1_audio_file
ON stage_1_llm_responses (audio_file);

-- Analyze tables for query optimization
ANALYZE audio_files;
ANALYZE stage_1_llm_responses;
