-- Remove warranty_months column from dentist_services table
ALTER TABLE dentist_services
DROP COLUMN IF EXISTS warranty_months;

-- Make warranty column NOT NULL with default empty string
ALTER TABLE dentist_services
ALTER COLUMN warranty SET NOT NULL,
ALTER COLUMN warranty SET DEFAULT '';