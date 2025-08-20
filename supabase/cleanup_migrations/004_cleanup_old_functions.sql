-- Drop the original function after the new ones are in place
DROP FUNCTION IF EXISTS get_snippets(
    p_language text,
    p_filter jsonb,
    page INTEGER,
    page_size INTEGER,
    p_order_by text,
    p_search_term text
);

-- Add comments to document the changes
COMMENT ON FUNCTION get_snippets_preview IS 'Optimized RPC function that returns lightweight snippet previews for the list view. Includes only essential fields needed for snippet cards.';

COMMENT ON FUNCTION get_snippet_details IS 'RPC function that returns detailed snippet information when viewing a single snippet. Includes all fields and related data.';

-- Update snippet table statistics
ANALYZE snippets;
ANALYZE user_star_snippets;
ANALYZE user_like_snippets;
ANALYZE user_hide_snippets;
ANALYZE snippet_labels;
ANALYZE label_upvotes;
