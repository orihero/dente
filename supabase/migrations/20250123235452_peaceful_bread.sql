-- Add status column to appointments table if it doesn't exist
DO $$ 
BEGIN
  -- Create enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
  END IF;

  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE appointments
    ADD COLUMN status appointment_status NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Add index for better query performance if it doesn't exist
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