-- Drop existing policies
DROP POLICY IF EXISTS "Dentists can manage their services" ON dentist_services;

-- Create comprehensive policies for dentist services
CREATE POLICY "dentist_services_select"
  ON dentist_services
  FOR SELECT
  USING (
    -- Allow access if:
    -- 1. User is the dentist who created the service
    dentist_id = auth.uid() OR
    -- 2. Service belongs to a dentist who has a patient with Telegram access
    EXISTS (
      SELECT 1 FROM patients
      WHERE (
        telegram_chat_id IS NOT NULL OR
        telegram_registration_token IS NOT NULL
      )
      AND dentist_id = dentist_services.dentist_id
    )
  );

CREATE POLICY "dentist_services_manage"
  ON dentist_services
  FOR ALL
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS dentist_services_dentist_id_idx ON dentist_services(dentist_id);

-- Grant necessary permissions
GRANT SELECT ON dentist_services TO anon;
GRANT SELECT ON dentist_services TO authenticated;

-- Add comment
COMMENT ON TABLE dentist_services IS 'Stores dentist-specific services with prices and details';