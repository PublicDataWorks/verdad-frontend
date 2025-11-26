SET search_path = public, "$user";

-- Create function for toggling global star status on recordings
-- No authentication required - this is a global star visible to all users
CREATE OR REPLACE FUNCTION toggle_recording_star (
    p_recording_id UUID
) RETURNS JSONB SECURITY DEFINER AS $$
DECLARE
    recording_exists BOOLEAN;
    current_starred BOOLEAN;
    new_starred BOOLEAN;
BEGIN
    -- Check if recording exists
    SELECT EXISTS(SELECT 1 FROM audio_files WHERE id = p_recording_id) INTO recording_exists;

    IF NOT recording_exists THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'Recording not found'
        );
    END IF;

    -- Get current starred status
    SELECT COALESCE(starred, FALSE) INTO current_starred
    FROM audio_files
    WHERE id = p_recording_id;

    -- Toggle the starred status
    new_starred := NOT current_starred;

    UPDATE audio_files
    SET starred = new_starred,
        updated_at = NOW()
    WHERE id = p_recording_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'starred', new_starred,
        'recording_id', p_recording_id
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION toggle_recording_star TO anon;
GRANT EXECUTE ON FUNCTION toggle_recording_star TO authenticated;
