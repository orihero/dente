-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can create leads" ON leads;
DROP POLICY IF EXISTS "Dentists can view leads they referred" ON leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;

-- Create new policies with fixed admin check
CREATE POLICY "Everyone can create leads"
  ON leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Dentists can view leads they referred"
  ON leads
  FOR SELECT
  USING (referred_by = auth.uid());

CREATE POLICY "Admins can manage all leads"
  ON leads
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
      AND auth.users.confirmed_at IS NOT NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@dente.uz'
      AND auth.users.confirmed_at IS NOT NULL
    )
  );

-- Grant necessary permissions
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON leads TO authenticated;