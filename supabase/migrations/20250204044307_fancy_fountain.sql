-- Drop existing policies for clinics
DROP POLICY IF EXISTS "Allow reading clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to manage clinics" ON clinics;

-- Create comprehensive policies for clinics
CREATE POLICY "clinics_read_policy"
  ON clinics
  FOR SELECT
  USING (true);

CREATE POLICY "clinics_admin_policy"
  ON clinics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type IN ('admin', 'manager')
    )
  );

-- Grant necessary permissions
GRANT ALL ON clinics TO authenticated;

-- Add enabled column if it doesn't exist
ALTER TABLE clinics
ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS clinics_enabled_idx ON clinics(enabled);

-- Add comment
COMMENT ON COLUMN clinics.enabled IS 'Whether the clinic is active and its dentists can log in';

-- Update existing clinics to be enabled by default
UPDATE clinics SET enabled = true WHERE enabled IS NULL;