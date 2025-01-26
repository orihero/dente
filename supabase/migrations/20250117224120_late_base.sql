-- Drop existing policies
DROP POLICY IF EXISTS "Allow dentists to read data" ON dentists;
DROP POLICY IF EXISTS "Allow dentists to update own data" ON dentists;
DROP POLICY IF EXISTS "Allow admins to update other dentists" ON dentists;
DROP POLICY IF EXISTS "Allow Telegram bot registration updates" ON dentists;
DROP POLICY IF EXISTS "Allow admins to create dentists" ON dentists;

-- Create simplified policies that avoid recursion
CREATE POLICY "Allow dentists to read data"
  ON dentists
  FOR SELECT
  USING (
    id = auth.uid() OR
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Create policy for self-updates
CREATE POLICY "Allow dentists to update own data"
  ON dentists
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create policy for admin updates
CREATE POLICY "Allow admins to update other dentists"
  ON dentists
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Create policy for Telegram registration
CREATE POLICY "Allow Telegram bot registration updates"
  ON dentists
  FOR UPDATE
  USING (telegram_registration_token IS NOT NULL)
  WITH CHECK (telegram_registration_token IS NOT NULL);

-- Create policy for admin inserts
CREATE POLICY "Allow admins to create dentists"
  ON dentists
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;