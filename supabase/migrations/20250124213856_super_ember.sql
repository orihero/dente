-- Create function to escape Markdown V2 special characters
CREATE OR REPLACE FUNCTION escape_markdown_v2(text)
RETURNS text AS $$
BEGIN
  RETURN regexp_replace(
    $1,
    '([_*\[\]()~`>#+=|{}.!-])',
    E'\\\\1',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update appointment reminder function to use escape_markdown_v2
CREATE OR REPLACE FUNCTION schedule_appointment_reminders()
RETURNS trigger AS $$
DECLARE
  dentist_settings jsonb;
  reminder_time timestamptz;
  escaped_patient_name text;
  escaped_dentist_name text;
  formatted_date text;
  formatted_time text;
BEGIN
  -- Get dentist settings
  SELECT appointment_settings->'reminders' INTO dentist_settings
  FROM dentists
  WHERE id = NEW.dentist_id;

  -- Only schedule if reminders are enabled
  IF (dentist_settings->>'enabled')::boolean THEN
    -- Calculate reminder time
    reminder_time := NEW.appointment_time - ((dentist_settings->>'hours_before')::int * interval '1 hour');

    -- Escape special characters for Telegram Markdown V2
    escaped_patient_name := escape_markdown_v2(
      (SELECT full_name FROM patients WHERE id = NEW.patient_id)
    );
    
    escaped_dentist_name := escape_markdown_v2(
      (SELECT full_name FROM dentists WHERE id = NEW.dentist_id)
    );
    
    -- Format date and time without escaping dots
    formatted_date := to_char(NEW.appointment_time, 'DD.MM.YYYY');
    formatted_time := to_char(NEW.appointment_time, 'HH24:MI');

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
        E'⏰ *Qabul eslatmasi*\n\nHurmatli *' || escaped_patient_name || E'*,\nSizning qabulingiz *' || escaped_dentist_name || E'* shifokor bilan *' || formatted_date || E'* kuni soat *' || formatted_time || E'* da\.\n\n📍 _Iltimos, belgilangan vaqtda keling\._',
        reminder_time
      FROM patients p
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
          formatted_date,
          formatted_time
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
        E'⏰ *Qabul eslatmasi*\n\nBemor: *' || escaped_patient_name || E'*\nSana: *' || formatted_date || E'*\nVaqt: *' || formatted_time || E'*',
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

-- Grant execute permission on the new function
GRANT EXECUTE ON FUNCTION escape_markdown_v2(text) TO authenticated;