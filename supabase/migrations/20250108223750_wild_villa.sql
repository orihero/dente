-- Add warranty column to dentist_services table
ALTER TABLE dentist_services
ADD COLUMN IF NOT EXISTS warranty text;

-- Update existing rows to have empty warranty text
UPDATE dentist_services
SET warranty = ''
WHERE warranty IS NULL;