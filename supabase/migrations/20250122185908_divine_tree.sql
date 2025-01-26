-- Drop old function and column if they exist
DROP FUNCTION IF EXISTS update_telegram_group_settings(text);
ALTER TABLE dentists DROP COLUMN IF EXISTS telegram_group_chat_id;

-- Create project settings table
CREATE TABLE IF NOT EXISTS project_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_group_chat_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE project_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for reading settings
CREATE POLICY "Allow reading project settings"
  ON project_settings
  FOR SELECT
  USING (true);

-- Create policy for updating settings
CREATE POLICY "Allow admins to update project settings"
  ON project_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );

-- Create function to update project telegram settings
CREATE OR REPLACE FUNCTION update_project_telegram_settings(group_chat_id text)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM dentists
    WHERE id = auth.uid()
    AND type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can update project settings';
  END IF;

  -- Insert or update settings
  INSERT INTO project_settings (telegram_group_chat_id)
  VALUES (group_chat_id)
  ON CONFLICT (id) DO UPDATE
  SET 
    telegram_group_chat_id = EXCLUDED.telegram_group_chat_id,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_project_telegram_settings TO authenticated;

-- Insert initial settings row
INSERT INTO project_settings (id)
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;