-- Drop existing policies for patients
DROP POLICY IF EXISTS "patients_select" ON patients;
DROP POLICY IF EXISTS "patients_manage" ON patients;

-- Create updated policies for patients
CREATE POLICY "patients_select"
  ON patients
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the patient
    dentist_id = auth.uid() OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Patient has Telegram access
    telegram_chat_id IS NOT NULL OR
    telegram_registration_token IS NOT NULL
  );

CREATE POLICY "patients_manage"
  ON patients
  FOR ALL
  USING (
    -- Allow if:
    -- 1. User is the dentist who created the patient
    dentist_id = auth.uid() OR
    -- 2. User is admin
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

-- Grant necessary permissions
GRANT SELECT ON auth.users TO anon;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON patients TO anon;
GRANT ALL ON patients TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS patients_telegram_chat_id_idx ON patients(telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS patients_telegram_registration_token_idx ON patients(telegram_registration_token) WHERE telegram_registration_token IS NOT NULL;

-- Add comment
COMMENT ON TABLE patients IS 'Stores patient information with access control for dentists and Telegram bot';