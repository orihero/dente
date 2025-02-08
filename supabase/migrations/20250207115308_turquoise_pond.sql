-- Drop existing policies
DROP POLICY IF EXISTS "patients_select" ON patients;
DROP POLICY IF EXISTS "patients_insert" ON patients;
DROP POLICY IF EXISTS "patients_update" ON patients;

-- Create updated policies for patients
CREATE POLICY "patients_select"
  ON patients
  FOR SELECT
  USING (true);  -- Allow public reads for Telegram bot

CREATE POLICY "patients_insert"
  ON patients
  FOR INSERT
  WITH CHECK (
    -- Allow if:
    -- 1. User is a dentist creating a patient
    (
      dentist_id = auth.uid() AND
      telegram_registration_token IS NULL AND
      telegram_chat_id IS NULL
    ) OR
    -- 2. User is admin
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Patient is being registered through Telegram
    (
      telegram_registration_token IS NOT NULL AND
      telegram_chat_id IS NOT NULL AND
      telegram_registered = true AND
      EXISTS (
        SELECT 1 FROM dentists
        WHERE dentists.id = patients.dentist_id
        AND dentists.telegram_bot_registered = true
      )
    ) OR
    -- 4. Allow public inserts for Telegram bot
    (auth.role() = 'anon')
  );

CREATE POLICY "patients_update"
  ON patients
  FOR UPDATE
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
    -- 3. Patient is being updated through Telegram
    telegram_registration_token IS NOT NULL OR
    -- 4. Allow public updates for Telegram bot
    (auth.role() = 'anon')
  )
  WITH CHECK (
    -- Same conditions as USING clause
    dentist_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    telegram_registration_token IS NOT NULL OR
    (auth.role() = 'anon')
  );

-- Grant necessary permissions
GRANT ALL ON patients TO anon;
GRANT ALL ON patients TO authenticated;

-- Add comment
COMMENT ON TABLE patients IS 'Stores patient information with access control for dentists, admins and Telegram bot';