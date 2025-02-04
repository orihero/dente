-- Add type column to dentist_requests table
ALTER TABLE dentist_requests
ADD COLUMN type text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS dentist_requests_type_idx ON dentist_requests(type);

-- Add comment
COMMENT ON COLUMN dentist_requests.type IS 'Type of request (feature, bug, suggestion, etc.)';