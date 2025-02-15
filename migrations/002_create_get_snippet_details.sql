-- Create function for fetching detailed snippet information
CREATE OR REPLACE FUNCTION get_snippet_details (
    snippet_id UUID,
    p_language text
) RETURNS jsonb SECURITY DEFINER AS $$
DECLARE
    current_user_id UUID;
    result jsonb;
BEGIN
    -- Get current user and validate
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Only logged-in users can call this function';
    END IF;

    -- Get detailed snippet data
    SELECT jsonb_build_object(
        'id', s.id,
        'recorded_at', s.recorded_at,
        'duration', s.duration,
        'start_time', s.start_time,
        'end_time', s.end_time,
        'file_path', s.file_path,
        'file_size', s.file_size,
        'political_leaning', s.political_leaning,
        'title', CASE
            WHEN p_language = 'spanish' THEN s.title ->> 'spanish'
            ELSE s.title ->> 'english'
        END,
        'summary', CASE
            WHEN p_language = 'spanish' THEN s.summary ->> 'spanish'
            ELSE s.summary ->> 'english'
        END,
        'explanation', CASE
            WHEN p_language = 'spanish' THEN s.explanation ->> 'spanish'
            ELSE s.explanation ->> 'english'
        END,
        'transcription', s.transcription,
        'translation', s.translation,
        'confidence_scores', s.confidence_scores,
        'language', s.language,
        'context', s.context,
        'labels', (get_snippet_labels(s.id, p_language) -> 'labels'),
        'audio_file', jsonb_build_object(
            'id', a.id,
            'radio_station_name', a.radio_station_name,
            'radio_station_code', a.radio_station_code,
            'location_state', a.location_state,
            'location_city', a.location_city
        ),
        'starred_by_user', CASE
            WHEN us.id IS NOT NULL THEN true
            ELSE false
        END,
        'user_like_status', ul.value,
        'like_count', COUNT(*) FILTER (WHERE uls.value = 1),
        'dislike_count', COUNT(*) FILTER (WHERE uls.value = -1),
        'hidden', uhs.snippet IS NOT NULL,
        'comment_count', (
            SELECT COUNT(*)
            FROM snippet_comments sc
            WHERE sc.snippet = s.id
        ),
        'upvote_count', (
            SELECT COUNT(*)
            FROM label_upvotes lu
            JOIN snippet_labels sl ON lu.snippet_label = sl.id
            WHERE sl.snippet = s.id
        )
    ) INTO result
    FROM snippets s
    LEFT JOIN audio_files a ON s.audio_file = a.id
    LEFT JOIN user_star_snippets us ON us.snippet = s.id AND us."user" = current_user_id
    LEFT JOIN user_like_snippets ul ON ul.snippet = s.id AND ul."user" = current_user_id
    LEFT JOIN user_like_snippets uls ON uls.snippet = s.id
    LEFT JOIN user_hide_snippets uhs ON uhs.snippet = s.id
    WHERE s.id = snippet_id
    GROUP BY s.id, a.id, us.id, ul.value, uhs.snippet;

    RETURN result;
END;
$$ LANGUAGE plpgsql;
