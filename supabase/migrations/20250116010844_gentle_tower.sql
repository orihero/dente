-- Add policy to allow reading dentists when checking registration tokens
CREATE POLICY "Allow reading dentists with registration tokens"
  ON dentists
  FOR SELECT
  USING (telegram_registration_token IS NOT NULL);

-- Add policy to allow reading patients when checking registration tokens
CREATE POLICY "Allow reading patients with registration tokens"
  ON patients
  FOR SELECT
  USING (telegram_registration_token IS NOT NULL);