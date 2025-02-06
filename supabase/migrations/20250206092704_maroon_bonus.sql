-- Drop existing policies
DROP POLICY IF EXISTS "Allow reading dentists" ON dentists;
DROP POLICY IF EXISTS "Allow dentists to update own data" ON dentists;
DROP POLICY IF EXISTS "Allow admins and managers to update other dentists" ON dentists;
DROP POLICY IF EXISTS "Allow admins and managers to create dentists" ON dentists;

-- Create comprehensive policies for dentists table
CREATE POLICY "dentists_select"
  ON dentists
  FOR SELECT
  USING (
    -- Allow if:
    -- 1. User is the dentist themselves
    id = auth.uid() OR
    -- 2. User is an admin/manager
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    ) OR
    -- 3. User has a valid Telegram registration token
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL
  );

CREATE POLICY "dentists_insert"
  ON dentists
  FOR INSERT
  WITH CHECK (
    -- Only admins/managers can create new dentists
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    )
  );

CREATE POLICY "dentists_update"
  ON dentists
  FOR UPDATE
  USING (
    -- Allow if:
    -- 1. User is updating their own data
    id = auth.uid() OR
    -- 2. User is an admin/manager
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    ) OR
    -- 3. User has a valid Telegram registration token
    telegram_registration_token IS NOT NULL
  )
  WITH CHECK (
    -- Same conditions as USING clause
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type IN ('admin', 'manager')
    ) OR
    telegram_registration_token IS NOT NULL
  );

CREATE POLICY "dentists_delete"
  ON dentists
  FOR DELETE
  USING (
    -- Only admins can delete dentists
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS dentists_type_idx ON dentists(type);

-- Grant necessary permissions
GRANT ALL ON dentists TO authenticated;

-- Add comment
COMMENT ON TABLE dentists IS 'Stores dentist information with role-based access control';