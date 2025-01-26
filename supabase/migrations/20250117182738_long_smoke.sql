-- Drop existing policies
DROP POLICY IF EXISTS "Dentists can manage data based on type" ON dentists;

-- Create separate policies for different operations
CREATE POLICY "Dentists can read their own data"
  ON dentists
  FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  );

CREATE POLICY "Dentists can update their own data"
  ON dentists
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all dentists"
  ON dentists
  USING (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  );

CREATE POLICY "Allow Telegram bot registration"
  ON dentists
  FOR UPDATE
  USING (telegram_registration_token IS NOT NULL)
  WITH CHECK (telegram_registration_token IS NOT NULL);