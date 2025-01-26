-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Add status column to appointments table
ALTER TABLE appointments
ADD COLUMN status appointment_status NOT NULL DEFAULT 'pending';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- Update existing appointments to confirmed status
UPDATE appointments
SET status = 'confirmed'
WHERE status = 'pending'
AND appointment_time < now();

-- Add comment
COMMENT ON COLUMN appointments.status IS 'Status of the appointment: pending (default), confirmed (by patient), cancelled (by patient), completed (by dentist)';

-- Add to realtime publication if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;

-- Ensure the table has replica identity
ALTER TABLE appointments REPLICA IDENTITY FULL;