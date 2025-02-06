-- Add experience column back to dentists table
ALTER TABLE dentists
ADD COLUMN experience integer DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS dentists_experience_idx ON dentists(experience);

-- Add comment
COMMENT ON COLUMN dentists.experience IS 'Years of experience for the dentist';

-- Update existing dentists to have 0 experience if null
UPDATE dentists
SET experience = 0
WHERE experience IS NULL;