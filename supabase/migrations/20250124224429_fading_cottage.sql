-- Add language column to patients table
ALTER TABLE patients
ADD COLUMN language text CHECK (language IN ('uz', 'ru'));

-- Add comment
COMMENT ON COLUMN patients.language IS 'Preferred language for notifications and bot interactions';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS patients_language_idx ON patients(language);