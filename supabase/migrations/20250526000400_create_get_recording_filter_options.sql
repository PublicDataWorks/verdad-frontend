SET search_path = public, "$user";

-- Create function for fetching available filter options for the recording browser
-- No authentication required
CREATE OR REPLACE FUNCTION get_recording_filter_options ()
RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'states', (
            SELECT COALESCE(jsonb_agg(DISTINCT location_state ORDER BY location_state), '[]'::jsonb)
            FROM audio_files
            WHERE location_state IS NOT NULL
        ),
        'radio_stations', (
            SELECT COALESCE(jsonb_agg(DISTINCT jsonb_build_object(
                'name', radio_station_name,
                'code', radio_station_code
            )), '[]'::jsonb)
            FROM (
                SELECT DISTINCT radio_station_name, radio_station_code
                FROM audio_files
                WHERE radio_station_name IS NOT NULL
                ORDER BY radio_station_name
            ) stations
        ),
        'languages', (
            SELECT COALESCE(jsonb_agg(DISTINCT language ORDER BY language), '[]'::jsonb)
            FROM (
                SELECT DISTINCT language->>'primary_language' AS language
                FROM snippets
                WHERE language->>'primary_language' IS NOT NULL
                  AND language->>'primary_language' != ''
                  AND status = 'Processed'
            ) langs
            WHERE language IS NOT NULL
        ),
        'labels', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'id', l.id,
                'text', l.text,
                'text_spanish', l.text_spanish
            )), '[]'::jsonb)
            FROM (
                SELECT DISTINCT l.id, l.text, l.text_spanish
                FROM labels l
                JOIN snippet_labels sl ON sl.label = l.id
                JOIN snippets s ON sl.snippet = s.id
                WHERE s.status = 'Processed'
                ORDER BY l.text
                LIMIT 100
            ) l
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION get_recording_filter_options TO anon;
GRANT EXECUTE ON FUNCTION get_recording_filter_options TO authenticated;
