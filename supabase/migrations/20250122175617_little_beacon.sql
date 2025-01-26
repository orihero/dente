-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can create leads" ON leads;
DROP POLICY IF EXISTS "Dentists can view leads they referred" ON leads;
DROP POLICY IF EXISTS "Dentists can view and manage leads" ON leads;
DROP POLICY IF EXISTS "Allow public access to leads" ON leads;

-- Create comprehensive policies for leads table
CREATE POLICY "Allow public to create leads"
  ON leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to read leads"
  ON leads
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to update leads"
  ON leads
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

-- Grant necessary permissions
GRANT INSERT ON leads TO anon;
GRANT INSERT ON leads TO authenticated;
GRANT SELECT ON leads TO anon;
GRANT SELECT ON leads TO authenticated;