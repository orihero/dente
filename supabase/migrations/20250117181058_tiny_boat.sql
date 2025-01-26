-- Add appointment_time column to leads table
ALTER TABLE leads
ADD COLUMN appointment_time timestamptz;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS leads_appointment_time_idx ON leads(appointment_time);