-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage their own data" ON dentists;

-- Create updated policy
CREATE POLICY "Users can manage their own data"
  ON dentists
  USING (id = auth.uid() OR telegram_registration_token IS NOT NULL)
  WITH CHECK (id = auth.uid());

-- Create policy specifically for Telegram updates
CREATE POLICY "Allow Telegram bot registration updates"
  ON dentists
  FOR UPDATE
  USING (telegram_registration_token IS NOT NULL)
  WITH CHECK (telegram_registration_token IS NOT NULL);