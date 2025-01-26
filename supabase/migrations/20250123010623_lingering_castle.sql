-- Drop ALL existing policies
DROP POLICY IF EXISTS "Dentists can manage their appointments" ON appointments;
DROP POLICY IF EXISTS "Allow reading appointments" ON appointments;
DROP POLICY IF EXISTS "Allow dentists to manage appointments" ON appointments;
DROP POLICY IF EXISTS "Allow public reading appointments" ON appointments;

-- Create new policies for appointments
CREATE POLICY "appointments_read_policy"
  ON appointments
  FOR SELECT
  USING (true);

CREATE POLICY "appointments_manage_policy"
  ON appointments
  FOR ALL
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