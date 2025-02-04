-- Create dentist requests table
CREATE TABLE IF NOT EXISTS dentist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE dentist_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for dentist requests
CREATE POLICY "dentists_read_own_requests"
  ON dentist_requests
  FOR SELECT
  USING (dentist_id = auth.uid());

CREATE POLICY "dentists_create_requests"
  ON dentist_requests
  FOR INSERT
  WITH CHECK (dentist_id = auth.uid());

CREATE POLICY "admins_manage_requests"
  ON dentist_requests
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS dentist_requests_dentist_id_idx ON dentist_requests(dentist_id);
CREATE INDEX IF NOT EXISTS dentist_requests_status_idx ON dentist_requests(status);
CREATE INDEX IF NOT EXISTS dentist_requests_created_at_idx ON dentist_requests(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_dentist_requests_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dentist_requests_updated_at
  BEFORE UPDATE ON dentist_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_dentist_requests_updated_at();

-- Grant necessary permissions
GRANT ALL ON dentist_requests TO authenticated;

-- Add comment
COMMENT ON TABLE dentist_requests IS 'Stores requests from dentists for features, bug reports, and other inquiries';