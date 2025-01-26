-- Add dentist type enum
CREATE TYPE dentist_type AS ENUM ('admin', 'regular');

-- Add type column to dentists table
ALTER TABLE dentists
ADD COLUMN type dentist_type NOT NULL DEFAULT 'regular';

-- Add indexes
CREATE INDEX IF NOT EXISTS dentists_type_idx ON dentists(type);

-- Create function to check if dentist is admin
CREATE OR REPLACE FUNCTION is_admin_dentist()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dentists
    WHERE id = auth.uid()
    AND type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_dentist() TO authenticated;

-- Update policies for leads table to allow admin access
DROP POLICY IF EXISTS "Dentists can view leads they referred" ON leads;
DROP POLICY IF EXISTS "Admins can manage all leads" ON leads;

CREATE POLICY "Dentists can view and manage leads"
  ON leads
  USING (
    referred_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  )
  WITH CHECK (
    referred_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );

-- Update policies for dentists table to allow admin access
DROP POLICY IF EXISTS "Dentists can manage their own data" ON dentists;

CREATE POLICY "Dentists can manage data based on type"
  ON dentists
  USING (
    id = auth.uid() OR
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  )
  WITH CHECK (
    id = auth.uid() OR
    telegram_registration_token IS NOT NULL OR
    telegram_bot_chat_id IS NOT NULL OR
    EXISTS (
      SELECT 1 FROM dentists d
      WHERE d.id = auth.uid()
      AND d.type = 'admin'
    )
  );