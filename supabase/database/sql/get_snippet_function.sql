CREATE
OR REPLACE FUNCTION get_snippet (
  snippet_id UUID,
  p_language TEXT DEFAULT 'english'
) RETURNS jsonb SECURITY DEFINER AS $$
DECLARE
    current_user_id UUID;
    user_roles TEXT[];
    is_hidden BOOLEAN;
    result jsonb;
BEGIN
    -- Check if the user is authenticated
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Only logged-in users can call this function';
    END IF;

    -- Get the role names from the roles table by joining with user_roles
    SELECT array_agg(r.name) INTO user_roles
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role = r.id
    WHERE ur."user" = current_user_id;

    -- Check if the snippet is currently hidden
    SELECT EXISTS (SELECT 1 FROM user_hide_snippets uhs WHERE uhs.snippet = snippet_id) INTO is_hidden;

    -- If the user does not have "admin" role and the snippet is currently hidden, do not return it
    IF (
        user_roles IS NULL
        OR ARRAY_LENGTH(user_roles, 1) = 0
        OR 'admin' <> ANY(user_roles)
    )
    AND is_hidden THEN RETURN '{}'::jsonb;

    END IF;

    -- Return the specified snippet, if its status is processed
    SELECT jsonb_build_object(
        'id', s.id,
        'recorded_at', s.recorded_at,
        'audio_file', jsonb_build_object(
            'id', a.id,
            'radio_station_name', a.radio_station_name,
            'radio_station_code', a.radio_station_code,
            'location_state', a.location_state,
            'location_city', a.location_city
        ),
        'duration', s.duration,
        'start_time', s.start_time,
        'end_time', s.end_time,
        'file_path', s.file_path,
        'file_size', s.file_size,
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
        'confidence_scores', s.confidence_scores,
        'language', s.language,
        'context', s.context,
        'starred_by_user', CASE
            WHEN us.id IS NOT NULL THEN true
            ELSE false
        END,
        'user_like_status', ul.value,
        'like_count', (SELECT COUNT(*) FROM user_like_snippets uls WHERE uls.snippet = s.id AND uls.value = 1),
        'dislike_count', (SELECT COUNT(*) FROM user_like_snippets uls WHERE uls.snippet = s.id AND uls.value = -1),
        'political_leaning', s.political_leaning,
        'status', s.status,
        'error_message', s.error_message,
        'labels', get_snippet_labels(s.id, p_language) -> 'labels',
        'hidden', is_hidden
    ) INTO result
    FROM snippets s
    LEFT JOIN user_star_snippets us ON s.id = us.snippet AND us."user" = current_user_id
    LEFT JOIN user_like_snippets ul ON s.id = ul.snippet AND ul."user" = current_user_id
    LEFT JOIN audio_files a ON s.audio_file = a.id
    WHERE s.id = snippet_id AND s.status = 'Processed';

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;
