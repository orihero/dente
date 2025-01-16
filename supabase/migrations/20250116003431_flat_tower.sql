-- Add custom loyalty programs
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id uuid NOT NULL REFERENCES dentists(id) ON DELETE CASCADE,
  name_uz text NOT NULL,
  name_ru text NOT NULL,
  description_uz text,
  description_ru text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  percentage numeric NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Dentists can manage their loyalty programs" ON loyalty_programs;
DROP POLICY IF EXISTS "Dentists can manage their patients" ON patients;

-- Create policies for loyalty programs
CREATE POLICY "Dentists can manage their loyalty programs"
  ON loyalty_programs
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

-- Create policies for patients
CREATE POLICY "Dentists can manage their patients"
  ON patients
  USING (dentist_id = auth.uid())
  WITH CHECK (dentist_id = auth.uid());

CREATE POLICY "Allow patient creation during Telegram bot registration"
  ON patients
  FOR INSERT
  WITH CHECK (
    telegram_chat_id IS NOT NULL AND
    telegram_registered = true AND
    EXISTS (
      SELECT 1 FROM dentists
      WHERE dentists.id = patients.dentist_id
      AND dentists.telegram_bot_registered = true
    )
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS loyalty_programs_dentist_id_idx ON loyalty_programs(dentist_id);
CREATE INDEX IF NOT EXISTS loyalty_programs_enabled_idx ON loyalty_programs(enabled);
CREATE INDEX IF NOT EXISTS loyalty_programs_date_range_idx ON loyalty_programs(start_date, end_date);