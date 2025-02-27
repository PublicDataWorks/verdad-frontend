-- Update get_snippets_preview function to include audio_file, political_leaning, and confidence_scores
CREATE OR REPLACE FUNCTION get_snippets_preview (
    p_language text,
    p_filter jsonb,
    page INTEGER,
    page_size INTEGER,
    p_order_by text,
    p_search_term text DEFAULT ''
) RETURNS jsonb SECURITY DEFINER AS $$
DECLARE
    current_user_id UUID;
    result jsonb;
    total_count INTEGER;
    total_pages INTEGER;
    user_roles TEXT[];
    user_is_admin BOOLEAN;
    trimmed_search_term TEXT := TRIM(p_search_term);
BEGIN
    -- Get current user and validate
    current_user_id := auth.uid();
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Only logged-in users can call this function';
    END IF;

    -- Check admin status
    SELECT array_agg(r.name) INTO user_roles
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role = r.id
    WHERE ur."user" = current_user_id;
    user_is_admin := COALESCE('admin' = ANY(user_roles), FALSE);

    -- Create temporary table with only preview data
    CREATE TEMP TABLE filtered_snippets AS
        SELECT
            s.id,
            s.recorded_at,
            s.start_time,
            s.file_path,
            CASE
                WHEN p_language = 'spanish' THEN s.title ->> 'spanish'
                ELSE s.title ->> 'english'
            END AS title,
            CASE
                WHEN p_language = 'spanish' THEN s.summary ->> 'spanish'
                ELSE s.summary ->> 'english'
            END AS summary,
            (get_snippet_labels(s.id, p_language) -> 'labels') AS labels,
            CASE
                WHEN us.id IS NOT NULL THEN true
                ELSE false
            END AS starred_by_user,
            ul.value AS user_like_status,
            like_counts.likes AS like_count,
            like_counts.dislikes AS dislike_count,
            uhs.snippet IS NOT NULL AS hidden,
            -- Add fields needed for proper rendering of snippet previews
            jsonb_build_object(
                'id', a.id,
                'radio_station_name', a.radio_station_name,
                'radio_station_code', a.radio_station_code,
                'location_state', a.location_state,
                'location_city', a.location_city
            ) AS audio_file,
            s.political_leaning,
            jsonb_build_object('level', s.confidence_scores->>'level') AS confidence_scores
        FROM snippets s
        LEFT JOIN audio_files a ON s.audio_file = a.id
        LEFT JOIN user_star_snippets us ON us.snippet = s.id AND us."user" = current_user_id
        LEFT JOIN user_like_snippets ul ON ul.snippet = s.id AND ul."user" = current_user_id
        LEFT JOIN user_hide_snippets uhs ON uhs.snippet = s.id
        CROSS JOIN LATERAL (
            SELECT
                COUNT(*) FILTER (WHERE value = 1) AS likes,
                COUNT(*) FILTER (WHERE value = -1) AS dislikes
            FROM user_like_snippets uls
            WHERE uls.snippet = s.id
        ) like_counts
        WHERE s.status = 'Processed' 
        AND (s.confidence_scores->>'overall')::INTEGER >= 95
        AND (
            user_is_admin OR 
            NOT EXISTS (
                SELECT 1 FROM user_hide_snippets uhs 
                WHERE uhs.snippet = s.id
            )
        )
        AND (
            trimmed_search_term = '' OR (
                ((s.title ->> 'english') || ' ' || (s.title ->> 'spanish')) &@ trimmed_search_term
                OR ((s.summary ->> 'english') || ' ' || (s.summary ->> 'spanish')) &@ trimmed_search_term
            )
        )
        ORDER BY 
            CASE
                WHEN p_order_by = 'upvotes' THEN s.upvote_count + s.like_count
                WHEN p_order_by = 'comments' THEN s.comment_count 
                WHEN p_order_by = 'activities' THEN 
                    CASE 
                        WHEN s.user_last_activity IS NULL THEN 0
                        ELSE EXTRACT(EPOCH FROM s.user_last_activity)
                    END
                ELSE EXTRACT(EPOCH FROM s.recorded_at)
            END DESC,
            s.recorded_at DESC;
        
    -- Get total count and paginate
    SELECT COUNT(*) INTO total_count
    FROM filtered_snippets;

    SELECT jsonb_agg(fs.*) INTO result
    FROM (
        SELECT * FROM filtered_snippets
        LIMIT page_size
        OFFSET page * page_size
    ) fs;

    DROP TABLE filtered_snippets;

    total_pages := CEIL(total_count::FLOAT / page_size);

    RETURN jsonb_build_object(
        'num_of_snippets', total_count,
        'snippets', COALESCE(result, '[]'::jsonb),
        'current_page', page,
        'page_size', page_size,
        'total_pages', total_pages
    );
END;
$$ LANGUAGE plpgsql;