-- Add clinic_id to dentists if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dentists'
    AND column_name = 'clinic_id'
  ) THEN
    ALTER TABLE dentists
    ADD COLUMN clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for clinic_id if it doesn't exist
CREATE INDEX IF NOT EXISTS dentists_clinic_id_idx ON dentists(clinic_id) WHERE clinic_id IS NOT NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow reading clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to manage clinics" ON clinics;

-- Create updated policies for clinics
CREATE POLICY "Allow reading clinics"
  ON clinics
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to manage clinics"
  ON clinics
  FOR ALL
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