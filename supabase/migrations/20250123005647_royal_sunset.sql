-- Drop existing policies
DROP POLICY IF EXISTS "Allow reading appointments" ON appointments;
DROP POLICY IF EXISTS "Allow dentists to manage appointments" ON appointments;

-- Create simplified policies for appointments
CREATE POLICY "Allow public reading appointments"
  ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "Allow dentists to manage appointments"
  ON appointments
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Ensure the table has replica identity
ALTER TABLE appointments REPLICA IDENTITY FULL;

-- Add appointments table to realtime publication if not already added
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