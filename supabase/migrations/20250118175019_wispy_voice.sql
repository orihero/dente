-- Create clinics table if it doesn't exist
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  city_uz text,
  city_ru text,
  district_uz text,
  district_ru text,
  address_uz text,
  address_ru text,
  working_hours jsonb DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "14:00"}, "sunday": null}'::jsonb,
  phone_numbers text[] DEFAULT ARRAY[]::text[],
  emails text[] DEFAULT ARRAY[]::text[],
  website text,
  social_media jsonb DEFAULT '{"instagram": null, "facebook": null, "telegram": null}'::jsonb,
  subscription_type clinic_subscription_type NOT NULL DEFAULT 'small',
  geo_location point,
  logo_url text,
  description_uz text,
  description_ru text,
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer DEFAULT 0,
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
  FOR ALL
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