-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow reading clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to manage clinics" ON clinics;

-- Create policies for clinics
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