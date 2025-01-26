-- Add appointment settings to dentists table
ALTER TABLE dentists
ADD COLUMN IF NOT EXISTS appointment_settings jsonb DEFAULT jsonb_build_object(
  'reminders', jsonb_build_object(
    'enabled', false,
    'hours_before', 24,
    'notify_dentist', true
  )
);

-- Create function to schedule appointment reminders
CREATE OR REPLACE FUNCTION schedule_appointment_reminders()
RETURNS trigger AS $$
DECLARE
  dentist_settings jsonb;
  reminder_time timestamptz;
BEGIN
  -- Get dentist settings
  SELECT appointment_settings->'reminders' INTO dentist_settings
  FROM dentists
  WHERE id = NEW.dentist_id;

  -- Only schedule if reminders are enabled
  IF (dentist_settings->>'enabled')::boolean THEN
    -- Calculate reminder time
    reminder_time := NEW.appointment_time - ((dentist_settings->>'hours_before')::int * interval '1 hour');

    -- Create notification for patient
    IF EXISTS (
      SELECT 1 FROM patients
      WHERE id = NEW.patient_id
      AND telegram_registered = true
      AND telegram_chat_id IS NOT NULL
    ) THEN
      -- Schedule Telegram notification
      INSERT INTO notifications (
        type,
        status,
        recipient,
        message,
        created_at
      )
      SELECT
        'telegram',
        'pending',
        p.telegram_chat_id,
        format(
          '⏰ *Qabul eslatmasi*\n\nHurmatli *%s*,\nSizning qabulingiz *%s* shifokor bilan *%s* kuni soat *%s* da\\.\n\n📍 _Iltimos, belgilangan vaqtda keling\\._',
          p.full_name,
          d.full_name,
          to_char(NEW.appointment_time, 'DD.MM.YYYY'),
          to_char(NEW.appointment_time, 'HH24:MI')
        ),
        reminder_time
      FROM patients p
      JOIN dentists d ON d.id = NEW.dentist_id
      WHERE p.id = NEW.patient_id;
    ELSE
      -- Schedule SMS notification
      INSERT INTO notifications (
        type,
        status,
        recipient,
        message,
        created_at
      )
      SELECT
        'sms',
        'pending',
        p.phone,
        format(
          'Hurmatli %s, sizning qabulingiz %s shifokor bilan %s kuni soat %s da.',
          p.full_name,
          d.full_name,
          to_char(NEW.appointment_time, 'DD.MM.YYYY'),
          to_char(NEW.appointment_time, 'HH24:MI')
        ),
        reminder_time
      FROM patients p
      JOIN dentists d ON d.id = NEW.dentist_id
      WHERE p.id = NEW.patient_id;
    END IF;

    -- Schedule notification for dentist if enabled
    IF (dentist_settings->>'notify_dentist')::boolean THEN
      INSERT INTO notifications (
        type,
        status,
        recipient,
        message,
        created_at
      )
      SELECT
        'telegram',
        'pending',
        d.telegram_bot_chat_id,
        format(
          '⏰ *Qabul eslatmasi*\n\nBemor: *%s*\nSana: *%s*\nVaqt: *%s*',
          p.full_name,
          to_char(NEW.appointment_time, 'DD.MM.YYYY'),
          to_char(NEW.appointment_time, 'HH24:MI')
        ),
        reminder_time
      FROM patients p
      JOIN dentists d ON d.id = NEW.dentist_id
      WHERE p.id = NEW.patient_id
      AND d.telegram_bot_registered = true
      AND d.telegram_bot_chat_id IS NOT NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment reminders
DROP TRIGGER IF EXISTS appointment_reminders_trigger ON appointments;
CREATE TRIGGER appointment_reminders_trigger
  AFTER INSERT OR UPDATE OF appointment_time
  ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION schedule_appointment_reminders();