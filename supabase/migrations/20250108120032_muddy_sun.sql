/*
  # Add service files table
  
  1. New Tables
    - service_files
      - id (uuid, primary key)
      - service_id (uuid, references patient_services)
      - file_url (text)
      - created_at (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policy for authenticated users
*/

-- Create service files table
CREATE TABLE service_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES patient_services(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_files ENABLE ROW LEVEL SECURITY;

-- Add policy
CREATE POLICY "Dentists can manage service files through patient services"
  ON service_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_services
      WHERE patient_services.id = service_files.service_id
      AND patient_services.dentist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_services
      WHERE patient_services.id = service_files.service_id
      AND patient_services.dentist_id = auth.uid()
    )
  );

-- Create storage bucket for service files
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-files', 'service-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated uploads to service-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-files' AND owner = auth.uid());

CREATE POLICY "Allow authenticated downloads from service-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'service-files');

CREATE POLICY "Allow authenticated deletes from service-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'service-files' AND owner = auth.uid());