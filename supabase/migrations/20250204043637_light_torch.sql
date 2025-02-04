-- Add enabled column to clinics table
ALTER TABLE clinics
ADD COLUMN enabled boolean NOT NULL DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS clinics_enabled_idx ON clinics(enabled);

-- Add comment
COMMENT ON COLUMN clinics.enabled IS 'Whether the clinic is active and its dentists can log in';