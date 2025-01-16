/*
  # Patient Notification System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `patient_id` (uuid, references patients)
      - `dentist_id` (uuid, references dentists)
      - `record_id` (uuid, references patient_records)
      - `type` (text, either 'sms' or 'telegram')
      - `status` (text, either 'pending', 'sent', 'failed')
      - `error` (text, optional error message)
      - `created_at` (timestamptz)
      - `sent_at` (timestamptz)

  2. Security
    - Enable RLS on `notifications` table
    - Add policy for dentists to manage their notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES patient_records(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sms', 'telegram')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error text,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dentists can manage their notifications"
  ON notifications
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS notifications_patient_id_idx ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS notifications_dentist_id_idx ON notifications(dentist_id);
CREATE INDEX IF NOT EXISTS notifications_record_id_idx ON notifications(record_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);