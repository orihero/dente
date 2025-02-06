-- Drop existing policies
DROP POLICY IF EXISTS "appointments_read_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_manage_policy" ON appointments;

-- Create updated policies for appointments
CREATE POLICY "appointments_select"
  ON appointments
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the appointment
    dentist_id = auth.uid() OR
    -- 2. User is an admin (checked via email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "appointments_manage"
  ON appointments
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Update policies for patient_records
DROP POLICY IF EXISTS "Dentists can manage their records" ON patient_records;

CREATE POLICY "records_select"
  ON patient_records
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the record
    dentist_id = auth.uid() OR
    -- 2. User is an admin (checked via email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "records_manage"
  ON patient_records
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Update policies for patients
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;
DROP POLICY IF EXISTS "Allow Telegram registration" ON patients;
DROP POLICY IF EXISTS "Allow balance updates for dentists" ON patients;

CREATE POLICY "patients_select"
  ON patients
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the patient
    dentist_id = auth.uid() OR
    -- 2. User is an admin (checked via email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "patients_manage"
  ON patients
  FOR ALL
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the patient
    dentist_id = auth.uid() OR
    -- 2. User is an admin (checked via email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Patient is being registered through Telegram
    telegram_registration_token IS NOT NULL
  )
  WITH CHECK (
    -- Same conditions as USING clause
    dentist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    telegram_registration_token IS NOT NULL
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS appointments_dentist_id_idx ON appointments(dentist_id);
CREATE INDEX IF NOT EXISTS patient_records_dentist_id_idx ON patient_records(dentist_id);
CREATE INDEX IF NOT EXISTS patients_dentist_id_idx ON patients(dentist_id);

-- Grant necessary permissions
GRANT ALL ON appointments TO authenticated;
GRANT ALL ON patient_records TO authenticated;
GRANT ALL ON patients TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Add comments
COMMENT ON TABLE appointments IS 'Stores appointments with dentist-specific access control';
COMMENT ON TABLE patient_records IS 'Stores patient records with dentist-specific access control';
COMMENT ON TABLE patients IS 'Stores patients with dentist-specific access control';