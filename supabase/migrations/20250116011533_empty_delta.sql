-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own data" ON dentists;
DROP POLICY IF EXISTS "Allow Telegram bot registration updates" ON dentists;
DROP POLICY IF EXISTS "Allow reading dentists with registration tokens" ON dentists;

-- Create comprehensive policy for dentist management
CREATE POLICY "Dentists can manage their own data"
  ON dentists
  USING (
    id = auth.uid() OR 
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL
  )
  WITH CHECK (
    id = auth.uid() OR 
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL
  );