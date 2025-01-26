-- Add telegram group settings to dentists
ALTER TABLE dentists
ADD COLUMN telegram_group_chat_id text;

-- Create function to update telegram group settings
CREATE OR REPLACE FUNCTION update_telegram_group_settings(group_chat_id text)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM dentists
    WHERE id = auth.uid()
    AND type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update telegram group settings';
  END IF;

  -- Update settings for admin
  UPDATE dentists
  SET telegram_group_chat_id = group_chat_id
  WHERE id = auth.uid()
  AND type = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_telegram_group_settings TO authenticated;