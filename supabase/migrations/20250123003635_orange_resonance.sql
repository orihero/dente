-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Dentists can manage their appointments" ON appointments;

-- Create comprehensive policy for appointments
CREATE POLICY "Allow reading appointments"
  ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow dentists to manage appointments"
  ON appointments
  FOR INSERT UPDATE DELETE
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add appointments table to realtime publication
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;

-- Ensure the table has replica identity
ALTER TABLE appointments REPLICA IDENTITY FULL;