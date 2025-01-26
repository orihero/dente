-- Add subscription type enum
CREATE TYPE clinic_subscription_type AS ENUM ('small', 'medium', 'large');

-- Enhance clinics table
ALTER TABLE clinics
ADD COLUMN city_uz text,
ADD COLUMN city_ru text,
ADD COLUMN district_uz text,
ADD COLUMN district_ru text,
ADD COLUMN working_hours jsonb DEFAULT '{"monday": {"open": "09:00", "close": "18:00"}, "tuesday": {"open": "09:00", "close": "18:00"}, "wednesday": {"open": "09:00", "close": "18:00"}, "thursday": {"open": "09:00", "close": "18:00"}, "friday": {"open": "09:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "14:00"}, "sunday": null}'::jsonb,
ADD COLUMN photos text[] DEFAULT ARRAY[]::text[],
ADD COLUMN logo_url text,
ADD COLUMN phone_numbers text[] DEFAULT ARRAY[]::text[],
ADD COLUMN emails text[] DEFAULT ARRAY[]::text[],
ADD COLUMN social_media jsonb DEFAULT '{"instagram": null, "facebook": null, "telegram": null}'::jsonb,
ADD COLUMN subscription_type clinic_subscription_type NOT NULL DEFAULT 'small',
ADD COLUMN geo_location point,
ADD COLUMN website text,
ADD COLUMN description_uz text,
ADD COLUMN description_ru text,
ADD COLUMN rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN review_count integer DEFAULT 0;

-- Create reviews table
CREATE TABLE IF NOT EXISTS clinic_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on reviews
ALTER TABLE clinic_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Allow reading clinic reviews"
  ON clinic_reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Allow patients to create reviews"
  ON clinic_reviews
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = patient_id
      AND patients.id IN (
        SELECT pr.patient_id FROM patient_records pr
        WHERE pr.dentist_id IN (
          SELECT d.id FROM dentists d
          WHERE d.clinic_id = clinic_reviews.clinic_id
        )
      )
    )
  );

-- Add function to update clinic rating
CREATE OR REPLACE FUNCTION update_clinic_rating()
RETURNS trigger AS $$
BEGIN
  WITH stats AS (
    SELECT 
      COUNT(*) as review_count,
      AVG(rating)::numeric(3,2) as avg_rating
    FROM clinic_reviews
    WHERE clinic_id = NEW.clinic_id
  )
  UPDATE clinics
  SET 
    rating = stats.avg_rating,
    review_count = stats.review_count
  FROM stats
  WHERE id = NEW.clinic_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_clinic_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON clinic_reviews
FOR EACH ROW EXECUTE FUNCTION update_clinic_rating();

-- Add indexes
CREATE INDEX IF NOT EXISTS clinics_subscription_type_idx ON clinics(subscription_type);
CREATE INDEX IF NOT EXISTS clinics_rating_idx ON clinics(rating);
CREATE INDEX IF NOT EXISTS clinic_reviews_clinic_id_idx ON clinic_reviews(clinic_id);
CREATE INDEX IF NOT EXISTS clinic_reviews_patient_id_idx ON clinic_reviews(patient_id);