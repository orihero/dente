-- Add record_id column to payments table
ALTER TABLE payments
ADD COLUMN record_id uuid REFERENCES patient_records(id) ON DELETE CASCADE;