-- Create appointment services table
CREATE TABLE IF NOT EXISTS appointment_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES dentist_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointment_services ENABLE ROW LEVEL SECURITY;

-- Create policy for appointment services
CREATE POLICY "appointment_services_select"
  ON appointment_services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_services.appointment_id
      AND (
        appointments.dentist_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.users.id = auth.uid()
          AND auth.users.email = 'admin@dente.uz'
        )
      )
    )
  );

CREATE POLICY "appointment_services_manage"
  ON appointment_services
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_services.appointment_id
      AND appointments.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_services.appointment_id
      AND appointments.dentist_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS appointment_services_appointment_id_idx ON appointment_services(appointment_id);
CREATE INDEX IF NOT EXISTS appointment_services_service_id_idx ON appointment_services(service_id);

-- Grant necessary permissions
GRANT ALL ON appointment_services TO authenticated;

-- Add comment
COMMENT ON TABLE appointment_services IS 'Stores services associated with appointments';