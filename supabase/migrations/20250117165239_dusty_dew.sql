-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;
DROP POLICY IF EXISTS "Allow patient creation during Telegram bot registration" ON patients;
DROP POLICY IF EXISTS "Allow balance updates for dentists" ON patients;
DROP POLICY IF EXISTS "Allow Telegram registration" ON patients;
DROP TRIGGER IF EXISTS validate_patient_updates ON patients;
DROP FUNCTION IF EXISTS check_patient_updates();

-- Create base policy for dentists
CREATE POLICY "Dentists can manage their patients"
  ON patients
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create policy for Telegram registration
CREATE POLICY "Allow Telegram registration"
  ON patients
  FOR ALL
  USING (
    telegram_registration_token IS NOT NULL OR
    telegram_chat_id IS NOT NULL
  )
  WITH CHECK (
    telegram_registration_token IS NOT NULL OR
    telegram_chat_id IS NOT NULL
  );

-- Create policy for SELECT operations
CREATE POLICY "Allow dentists to view their patients"
  ON patients
  FOR SELECT
  USING (dentist_id = auth.uid());

-- Create policy for UPDATE operations
CREATE POLICY "Allow dentists to update their patients"
  ON patients
  FOR UPDATE
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create function to handle balance updates
CREATE OR REPLACE FUNCTION update_patient_balance(
  patient_id uuid,
  new_balance numeric
) RETURNS void AS $$
BEGIN
  UPDATE patients
  SET balance = new_balance
  WHERE id = patient_id
  AND dentist_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_patient_balance TO authenticated;