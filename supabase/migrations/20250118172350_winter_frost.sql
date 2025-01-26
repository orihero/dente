-- Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  address_uz text,
  address_ru text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add clinic_id to dentists
ALTER TABLE dentists
ADD COLUMN clinic_id uuid REFERENCES clinics(id) ON DELETE SET NULL;

-- Enable RLS on clinics
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

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

-- Add indexes
CREATE INDEX IF NOT EXISTS dentists_clinic_id_idx ON dentists(clinic_id);