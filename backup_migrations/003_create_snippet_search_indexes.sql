-- Create indexes to improve search and filtering performance

-- Index for language filtering
CREATE INDEX IF NOT EXISTS idx_snippets_primary_language 
ON snippets ((language->>'primary_language'));

-- Index for confidence score filtering
CREATE INDEX IF NOT EXISTS idx_snippets_confidence_score 
ON snippets (((confidence_scores->>'overall')::INTEGER));

-- Indexes for text search fields
CREATE INDEX IF NOT EXISTS idx_snippets_title_english 
ON snippets ((title->>'english'));

CREATE INDEX IF NOT EXISTS idx_snippets_title_spanish 
ON snippets ((title->>'spanish'));

CREATE INDEX IF NOT EXISTS idx_snippets_summary_english 
ON snippets ((summary->>'english'));

CREATE INDEX IF NOT EXISTS idx_snippets_summary_spanish 
ON snippets ((summary->>'spanish'));

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_snippets_status 
ON snippets (status);

-- Index for sorting by recorded_at
CREATE INDEX IF NOT EXISTS idx_snippets_recorded_at 
ON snippets (recorded_at DESC);

-- Index for sorting by user activity
CREATE INDEX IF NOT EXISTS idx_snippets_user_last_activity 
ON snippets (user_last_activity DESC);

-- Combined index for common filtering scenario
CREATE INDEX IF NOT EXISTS idx_snippets_status_confidence
ON snippets (status, ((confidence_scores->>'overall')::INTEGER))
WHERE status = 'Processed';

-- Partial index for visible snippets
CREATE INDEX IF NOT EXISTS idx_snippets_visible
ON snippets (id)
WHERE status = 'Processed' AND (confidence_scores->>'overall')::INTEGER >= 95;

-- Add statistics gathering
ANALYZE snippets;
