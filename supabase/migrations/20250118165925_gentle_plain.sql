-- Drop existing policies
DROP POLICY IF EXISTS "Allow dentists to read data" ON dentists;
DROP POLICY IF EXISTS "Allow dentists to update own data" ON dentists;
DROP POLICY IF EXISTS "Allow admins to update other dentists" ON dentists;
DROP POLICY IF EXISTS "Allow Telegram bot registration updates" ON dentists;
DROP POLICY IF EXISTS "Allow admins to create dentists" ON dentists;

-- Create simplified read policy
CREATE POLICY "Allow reading dentists"
  ON dentists
  FOR SELECT
  USING (true);

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

-- Create policy for admin inserts
CREATE POLICY "Allow admins to create dentists"
  ON dentists
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  );