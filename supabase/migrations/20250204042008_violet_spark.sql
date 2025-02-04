-- Drop existing policies
DROP POLICY IF EXISTS "Allow admins and managers to read lead comments" ON lead_comments;
DROP POLICY IF EXISTS "Allow admins and managers to manage lead comments" ON lead_comments;

-- Create updated policies for lead comments
CREATE POLICY "Allow admins and managers to read lead comments"
  ON lead_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type IN ('admin', 'manager')
    )
  );

CREATE POLICY "Allow admins and managers to manage lead comments"
  ON lead_comments
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
GRANT ALL ON lead_comments TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS lead_comments_lead_id_created_at_idx ON lead_comments(lead_id, created_at);
CREATE INDEX IF NOT EXISTS lead_comments_dentist_id_idx ON lead_comments(dentist_id);