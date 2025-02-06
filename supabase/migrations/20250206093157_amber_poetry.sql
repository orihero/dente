-- Drop existing policies
DROP POLICY IF EXISTS "dentists_select" ON dentists;
DROP POLICY IF EXISTS "dentists_insert" ON dentists;
DROP POLICY IF EXISTS "dentists_update" ON dentists;
DROP POLICY IF EXISTS "dentists_delete" ON dentists;

-- Create simplified policies that avoid recursion
CREATE POLICY "dentists_select"
  ON dentists
  FOR SELECT
  USING (true);  -- Allow all authenticated users to read

CREATE POLICY "dentists_insert"
  ON dentists
  FOR INSERT
  WITH CHECK (
    -- Only allow insert during initial user creation
    -- or when user is admin (checked via email)
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

CREATE POLICY "dentists_update"
  ON dentists
  FOR UPDATE
  USING (
    -- Allow if:
    -- 1. User is updating their own data
    id = auth.uid() OR
    -- 2. User is admin (checked via email)
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    -- 3. Has valid Telegram token
    telegram_registration_token IS NOT NULL
  )
  WITH CHECK (
    -- Same conditions as USING clause
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    ) OR
    telegram_registration_token IS NOT NULL
  );

CREATE POLICY "dentists_delete"
  ON dentists
  FOR DELETE
  USING (
    -- Only admin can delete
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
    )
  );

-- Grant necessary permissions
GRANT ALL ON dentists TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Add comment
COMMENT ON TABLE dentists IS 'Stores dentist information with role-based access control';