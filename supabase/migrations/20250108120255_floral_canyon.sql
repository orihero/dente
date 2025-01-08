-- Add service_date column to patient_services table
ALTER TABLE patient_services 
ADD COLUMN IF NOT EXISTS service_date date NOT NULL DEFAULT CURRENT_DATE;