-- Drop existing policies
DROP POLICY IF EXISTS "Allow reading appointments" ON appointments;
DROP POLICY IF EXISTS "Allow dentists to manage appointments" ON appointments;

-- Create comprehensive policies for appointments
CREATE POLICY "Allow reading appointments"
  ON appointments
  FOR SELECT
  USING (
    -- Allow reading if:
    -- 1. User is the dentist who created the appointment
    dentist_id = auth.uid() OR
    -- 2. User is the patient with this appointment
    patient_id IN (
      SELECT id FROM patients
      WHERE telegram_chat_id IS NOT NULL
    ) OR
    -- 3. User is an admin
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );

CREATE POLICY "Allow dentists to manage appointments"
  ON appointments
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

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

-- Ensure the table has replica identity
ALTER TABLE appointments REPLICA IDENTITY FULL;