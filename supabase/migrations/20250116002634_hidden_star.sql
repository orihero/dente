-- Drop existing policy for patients
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;

-- Create new policies for patients
CREATE POLICY "Dentists can manage their patients"
  ON patients
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

CREATE POLICY "Allow patient creation during Telegram bot registration"
  ON patients
  FOR INSERT
  WITH CHECK (
    telegram_chat_id IS NOT NULL AND
    telegram_registered = true AND
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = patients.dentist_id
      AND dentists.telegram_bot_registered = true
    )
  );