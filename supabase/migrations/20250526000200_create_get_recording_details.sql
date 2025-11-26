SET search_path = public, "$user";

-- Create function for fetching detailed recording information
-- No authentication required - this is for the public recording browser
CREATE OR REPLACE FUNCTION get_recording_details (
    p_recording_id UUID,
    p_language TEXT DEFAULT 'english'
) RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
    result JSONB;
    recording_exists BOOLEAN;
BEGIN
    -- Check if recording exists
    SELECT EXISTS(SELECT 1 FROM audio_files WHERE id = p_recording_id) INTO recording_exists;

    IF NOT recording_exists THEN
        RETURN jsonb_build_object('error', 'Recording not found');
    END IF;

    -- Get detailed recording data with transcript and snippets
    SELECT jsonb_build_object(
        'id', af.id,
        'radio_station_name', af.radio_station_name,
        'radio_station_code', af.radio_station_code,
        'location_state', af.location_state,
        'location_city', af.location_city,
        'recorded_at', af.recorded_at,
        'recording_day_of_week', af.recording_day_of_week,
        'file_path', af.file_path,
        'file_size', af.file_size,
        'status', af.status,
        'starred', COALESCE(af.starred, FALSE),
        'created_at', af.created_at,
        -- Transcript data from stage_1_llm_responses
        'transcript', jsonb_build_object(
            'initial_transcription', s1.initial_transcription,
            'timestamped_transcription', s1.timestamped_transcription,
            'transcriptor', s1.transcriptor
        ),
        -- Snippet count
        'snippet_count', (
            SELECT COUNT(*)
            FROM snippets s
            WHERE s.audio_file = af.id
              AND s.status = 'Processed'
        ),
        'has_snippets', (
            SELECT COUNT(*) > 0
            FROM snippets s
            WHERE s.audio_file = af.id
              AND s.status = 'Processed'
        ),
        -- Array of derived snippets
        'snippets', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'title', CASE
                        WHEN p_language = 'spanish' THEN COALESCE(s.title->>'spanish', s.title->>'english')
                        ELSE COALESCE(s.title->>'english', s.title->>'spanish')
                    END,
                    'summary', CASE
                        WHEN p_language = 'spanish' THEN COALESCE(s.summary->>'spanish', s.summary->>'english')
                        ELSE COALESCE(s.summary->>'english', s.summary->>'spanish')
                    END,
                    'start_time', s.start_time,
                    'end_time', s.end_time,
                    'duration', s.duration,
                    'file_path', s.file_path,
                    'transcription', s.transcription,
                    'translation', s.translation,
                    'confidence_scores', s.confidence_scores,
                    'language', s.language,
                    'labels', (
                        SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                                'id', l.id,
                                'text', CASE
                                    WHEN p_language = 'spanish' THEN COALESCE(l.text_spanish, l.text)
                                    ELSE l.text
                                END
                            )
                        ), '[]'::jsonb)
                        FROM snippet_labels sl
                        JOIN labels l ON sl.label = l.id
                        WHERE sl.snippet = s.id
                    )
                )
                ORDER BY s.start_time
            )
            FROM snippets s
            WHERE s.audio_file = af.id
              AND s.status = 'Processed'),
            '[]'::jsonb
        )
    ) INTO result
    FROM audio_files af
    LEFT JOIN stage_1_llm_responses s1 ON s1.audio_file = af.id
    WHERE af.id = p_recording_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION get_recording_details TO anon;
GRANT EXECUTE ON FUNCTION get_recording_details TO authenticated;
