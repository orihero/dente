-- Create clinics table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  address_uz text,
  address_ru text,
  phone_numbers text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on clinics if not already enabled
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow reading clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to manage clinics" ON clinics;

-- Create policies for clinics
CREATE POLICY "Allow reading clinics"
  ON clinics
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to manage clinics"
  ON clinics
  USING (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = auth.uid()
      AND dentists.type = 'admin'
    )
  );