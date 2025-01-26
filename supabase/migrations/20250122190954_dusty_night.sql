-- Create lead comments table
CREATE TABLE IF NOT EXISTS lead_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for reading comments
CREATE POLICY "Allow admins to read lead comments"
  ON lead_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );

-- Create policy for managing comments
CREATE POLICY "Allow admins to manage lead comments"
  ON lead_comments
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

-- Add indexes
CREATE INDEX lead_comments_lead_id_idx ON lead_comments(lead_id);
CREATE INDEX lead_comments_dentist_id_idx ON lead_comments(dentist_id);