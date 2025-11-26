SET search_path = public, "$user";

-- Update function to include total_count on first page load
-- This counts ALL matching records, not just the current page
CREATE OR REPLACE FUNCTION get_recordings_preview (
    p_cursor TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_filter JSONB DEFAULT '{}'::jsonb,
    p_search_term TEXT DEFAULT ''
) RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
    result JSONB;
    next_cursor TIMESTAMP WITH TIME ZONE;
    has_more BOOLEAN;
    total_count BIGINT;
    trimmed_search_term TEXT := TRIM(COALESCE(p_search_term, ''));
    filter_state TEXT;
    filter_radio_station TEXT;
    filter_has_snippets TEXT;
    filter_starred BOOLEAN;
    filter_label TEXT;
    filter_language TEXT;
BEGIN
    -- Extract filter values
    filter_state := p_filter->>'state';
    filter_radio_station := p_filter->>'radio_station';
    filter_has_snippets := p_filter->>'has_snippets';
    filter_starred := (p_filter->>'starred')::BOOLEAN;
    filter_label := p_filter->>'label';
    filter_language := p_filter->>'language';

    -- Only calculate total_count on first page (cursor is NULL) for performance
    -- This avoids expensive COUNT on every page load
    IF p_cursor IS NULL THEN
        SELECT COUNT(*)
        INTO total_count
        FROM audio_files af
        LEFT JOIN stage_1_llm_responses s1 ON s1.audio_file = af.id
        LEFT JOIN LATERAL (
            SELECT COUNT(*) AS snippet_count
            FROM snippets s
            WHERE s.audio_file = af.id
              AND s.status = 'Processed'
        ) snippet_counts ON TRUE
        WHERE
            -- State filter
            (filter_state IS NULL OR af.location_state = filter_state)
            -- Radio station filter
            AND (filter_radio_station IS NULL OR af.radio_station_name = filter_radio_station)
            -- Has snippets filter
            AND (
                filter_has_snippets IS NULL
                OR filter_has_snippets = 'all'
                OR (filter_has_snippets = 'with' AND COALESCE(snippet_counts.snippet_count, 0) > 0)
                OR (filter_has_snippets = 'without' AND COALESCE(snippet_counts.snippet_count, 0) = 0)
            )
            -- Starred filter
            AND (filter_starred IS NULL OR filter_starred = FALSE OR af.starred = TRUE)
            -- Label filter
            AND (
                filter_label IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM snippets s
                    JOIN snippet_labels sl ON sl.snippet = s.id
                    JOIN labels l ON sl.label = l.id
                    WHERE s.audio_file = af.id
                      AND (l.text ILIKE '%' || filter_label || '%' OR l.text_spanish ILIKE '%' || filter_label || '%')
                )
            )
            -- Language filter
            AND (
                filter_language IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM snippets s
                    WHERE s.audio_file = af.id
                      AND s.language->>'primary_language' ILIKE '%' || filter_language || '%'
                )
            )
            -- Full-text search
            AND (
                trimmed_search_term = ''
                OR s1.initial_transcription ILIKE '%' || trimmed_search_term || '%'
            );
    ELSE
        total_count := NULL;
    END IF;

    -- Create temporary table with filtered recordings
    CREATE TEMP TABLE temp_recordings ON COMMIT DROP AS
    SELECT
        af.id,
        af.radio_station_name,
        af.radio_station_code,
        af.location_state,
        af.location_city,
        af.recorded_at,
        af.recording_day_of_week,
        af.file_path,
        af.file_size,
        af.status,
        COALESCE(af.starred, FALSE) AS starred,
        COALESCE(snippet_counts.snippet_count, 0) AS snippet_count,
        COALESCE(snippet_counts.snippet_count, 0) > 0 AS has_snippets,
        s1.id AS stage_1_id,
        COALESCE(
            (SELECT s.language->>'primary_language'
             FROM snippets s
             WHERE s.audio_file = af.id
             LIMIT 1),
            'Unknown'
        ) AS primary_language
    FROM audio_files af
    LEFT JOIN stage_1_llm_responses s1 ON s1.audio_file = af.id
    LEFT JOIN LATERAL (
        SELECT COUNT(*) AS snippet_count
        FROM snippets s
        WHERE s.audio_file = af.id
          AND s.status = 'Processed'
    ) snippet_counts ON TRUE
    WHERE
        (p_cursor IS NULL OR af.recorded_at < p_cursor)
        AND (filter_state IS NULL OR af.location_state = filter_state)
        AND (filter_radio_station IS NULL OR af.radio_station_name = filter_radio_station)
        AND (
            filter_has_snippets IS NULL
            OR filter_has_snippets = 'all'
            OR (filter_has_snippets = 'with' AND COALESCE(snippet_counts.snippet_count, 0) > 0)
            OR (filter_has_snippets = 'without' AND COALESCE(snippet_counts.snippet_count, 0) = 0)
        )
        AND (filter_starred IS NULL OR filter_starred = FALSE OR af.starred = TRUE)
        AND (
            filter_label IS NULL
            OR EXISTS (
                SELECT 1
                FROM snippets s
                JOIN snippet_labels sl ON sl.snippet = s.id
                JOIN labels l ON sl.label = l.id
                WHERE s.audio_file = af.id
                  AND (l.text ILIKE '%' || filter_label || '%' OR l.text_spanish ILIKE '%' || filter_label || '%')
            )
        )
        AND (
            filter_language IS NULL
            OR EXISTS (
                SELECT 1
                FROM snippets s
                WHERE s.audio_file = af.id
                  AND s.language->>'primary_language' ILIKE '%' || filter_language || '%'
            )
        )
        AND (
            trimmed_search_term = ''
            OR s1.initial_transcription ILIKE '%' || trimmed_search_term || '%'
        )
    ORDER BY af.recorded_at DESC
    LIMIT p_limit + 1;

    -- Check if there are more results
    SELECT COUNT(*) > p_limit INTO has_more FROM temp_recordings;

    -- Get the cursor for the next page
    SELECT recorded_at INTO next_cursor
    FROM temp_recordings
    ORDER BY recorded_at DESC
    OFFSET p_limit - 1
    LIMIT 1;

    -- Build result JSON with total_count
    SELECT jsonb_build_object(
        'recordings', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', tr.id,
                    'radio_station_name', tr.radio_station_name,
                    'radio_station_code', tr.radio_station_code,
                    'location_state', tr.location_state,
                    'location_city', tr.location_city,
                    'recorded_at', tr.recorded_at,
                    'recording_day_of_week', tr.recording_day_of_week,
                    'file_path', tr.file_path,
                    'file_size', tr.file_size,
                    'status', tr.status,
                    'starred', tr.starred,
                    'snippet_count', tr.snippet_count,
                    'has_snippets', tr.has_snippets,
                    'primary_language', tr.primary_language
                )
            )
            FROM (
                SELECT * FROM temp_recordings
                ORDER BY recorded_at DESC
                LIMIT p_limit
            ) tr),
            '[]'::jsonb
        ),
        'next_cursor', next_cursor,
        'has_more', has_more,
        'total_count', total_count
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
