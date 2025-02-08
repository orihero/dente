-- Drop existing policies
DROP POLICY IF EXISTS "appointments_select" ON appointments;
DROP POLICY IF EXISTS "appointments_manage" ON appointments;

-- Create updated policies for appointments
CREATE POLICY "appointments_select"
  ON appointments
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the appointment
    dentist_id = auth.uid() OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Appointment belongs to a patient with Telegram access
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND (
        patients.telegram_chat_id IS NOT NULL OR
        patients.telegram_registration_token IS NOT NULL
      )
    )
  );

CREATE POLICY "appointments_insert"
  ON appointments
  FOR INSERT
  WITH CHECK (
    -- Allow if:
    -- 1. User is the dentist creating the appointment
    dentist_id = auth.uid() OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "appointments_update"
  ON appointments
  FOR UPDATE
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the appointment
    dentist_id = auth.uid() OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Update is coming from a patient with Telegram access
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND (
        patients.telegram_chat_id IS NOT NULL OR
        patients.telegram_registration_token IS NOT NULL
      )
    )
  )
  WITH CHECK (
    -- Same conditions as USING clause
    dentist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = appointments.patient_id
      AND (
        patients.telegram_chat_id IS NOT NULL OR
        patients.telegram_registration_token IS NOT NULL
      )
    )
  );

CREATE POLICY "appointments_delete"
  ON appointments
  FOR DELETE
  USING (
    -- Only dentists and admins can delete appointments
    dentist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Grant necessary permissions
GRANT ALL ON appointments TO anon;
GRANT ALL ON appointments TO authenticated;

-- Add comment
COMMENT ON TABLE appointments IS 'Stores appointments with access control for dentists, admins and Telegram bot';