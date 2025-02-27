-- Create a materialized view for faster snippet previews
SET search_path = public, "$user";

-- Drop view if it exists
DROP MATERIALIZED VIEW IF EXISTS snippets_preview_view;

-- Create materialized view for faster initial loading
CREATE MATERIALIZED VIEW snippets_preview_view AS
SELECT
    s.id,
    s.recorded_at,
    s.start_time,
    s.file_path,
    s.title,
    s.summary,
    jsonb_build_object(
        'id', a.id,
        'radio_station_name', a.radio_station_name,
        'radio_station_code', a.radio_station_code,
        'location_state', a.location_state,
        'location_city', a.location_city
    ) AS audio_file,
    s.political_leaning,
    jsonb_build_object('level', s.confidence_scores->>'level') AS confidence_scores,
    s.comment_count,
    s.like_count,
    s.dislike_count,
    s.upvote_count
FROM 
    snippets s
    LEFT JOIN audio_files a ON s.audio_file = a.id
WHERE 
    s.status = 'Processed' 
    AND (s.confidence_scores->>'overall')::INTEGER >= 95;

-- Create indexes on the materialized view for faster querying
CREATE INDEX idx_snippets_preview_view_id ON snippets_preview_view(id);
CREATE INDEX idx_snippets_preview_view_recorded_at ON snippets_preview_view(recorded_at DESC);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_snippets_preview_view()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY snippets_preview_view;
    RETURN NULL;
END $$;

-- Create trigger to refresh the view when snippets are updated
CREATE TRIGGER refresh_snippets_preview_view_trigger
AFTER INSERT OR UPDATE OR DELETE ON snippets
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_snippets_preview_view();

-- Update get_snippets_preview function to use the materialized view
CREATE OR REPLACE FUNCTION get_snippets_preview (
    p_language text,
    p_filter jsonb,
    page INTEGER,
    page_size INTEGER DEFAULT 20,
    p_order_by text DEFAULT 'latest',
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

    -- Create temporary table with only preview data - now using materialized view
    CREATE TEMP TABLE filtered_snippets AS
        SELECT
            mv.id,
            mv.recorded_at,
            mv.start_time,
            mv.file_path,
            CASE
                WHEN p_language = 'spanish' THEN mv.title ->> 'spanish'
                ELSE mv.title ->> 'english'
            END AS title,
            CASE
                WHEN p_language = 'spanish' THEN mv.summary ->> 'spanish'
                ELSE mv.summary ->> 'english'
            END AS summary,
            (get_snippet_labels(mv.id, p_language) -> 'labels') AS labels,
            CASE
                WHEN us.id IS NOT NULL THEN true
                ELSE false
            END AS starred_by_user,
            ul.value AS user_like_status,
            COALESCE(like_counts.likes, 0) AS like_count,
            COALESCE(like_counts.dislikes, 0) AS dislike_count,
            uhs.snippet IS NOT NULL AS hidden,
            mv.audio_file,
            mv.political_leaning,
            mv.confidence_scores
        FROM snippets_preview_view mv
        LEFT JOIN user_star_snippets us ON us.snippet = mv.id AND us."user" = current_user_id
        LEFT JOIN user_like_snippets ul ON ul.snippet = mv.id AND ul."user" = current_user_id
        LEFT JOIN user_hide_snippets uhs ON uhs.snippet = mv.id
        LEFT JOIN LATERAL (
            SELECT
                COUNT(*) FILTER (WHERE value = 1) AS likes,
                COUNT(*) FILTER (WHERE value = -1) AS dislikes
            FROM user_like_snippets uls
            WHERE uls.snippet = mv.id
        ) like_counts ON true
        WHERE (
            user_is_admin OR 
            NOT EXISTS (
                SELECT 1 FROM user_hide_snippets uhs 
                WHERE uhs.snippet = mv.id
            )
        )
        AND (
            trimmed_search_term = '' OR (
                ((mv.title ->> 'english') || ' ' || (mv.title ->> 'spanish')) &@ trimmed_search_term
                OR ((mv.summary ->> 'english') || ' ' || (mv.summary ->> 'spanish')) &@ trimmed_search_term
            )
        )
        ORDER BY 
            CASE
                WHEN p_order_by = 'upvotes' THEN mv.upvote_count + COALESCE(like_counts.likes, 0)
                WHEN p_order_by = 'comments' THEN mv.comment_count 
                ELSE EXTRACT(EPOCH FROM mv.recorded_at)
            END DESC,
            mv.recorded_at DESC;
        
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