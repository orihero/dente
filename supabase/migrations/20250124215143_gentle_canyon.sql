-- Create or replace function to properly escape Markdown V2 text
CREATE OR REPLACE FUNCTION escape_markdown_v2(text)
RETURNS text AS $$
BEGIN
  -- First escape special characters
  RETURN regexp_replace(
    $1,
    '([_*\[\]()~`>#+=|{}.!-])',
    E'\\\\\\1',
    'g'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update appointment reminder function to handle both new and updated appointments
CREATE OR REPLACE FUNCTION schedule_appointment_reminders()
RETURNS trigger AS $$
DECLARE
  dentist_settings jsonb;
  reminder_time timestamptz;
  escaped_patient_name text;
  escaped_dentist_name text;
  formatted_date text;
  formatted_time text;
  old_formatted_date text;
  old_formatted_time text;
  is_update boolean;
BEGIN
  -- Get dentist settings
  SELECT appointment_settings->'reminders' INTO dentist_settings
  FROM dentists
  WHERE id = NEW.dentist_id;

  -- Check if this is an update
  is_update := TG_OP = 'UPDATE' AND OLD.appointment_time != NEW.appointment_time;

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
    
    -- Format new date and time with escaped dots
    formatted_date := escape_markdown_v2(to_char(NEW.appointment_time, 'DD.MM.YYYY'));
    formatted_time := to_char(NEW.appointment_time, 'HH24:MI');

    -- Format old date and time if this is an update
    IF is_update THEN
      old_formatted_date := escape_markdown_v2(to_char(OLD.appointment_time, 'DD.MM.YYYY'));
      old_formatted_time := to_char(OLD.appointment_time, 'HH24:MI');
    END IF;

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
        CASE 
          WHEN is_update THEN
            -- Update message with old and new times
            E'🔄 *Qabul vaqti o''zgartirildi*\n\n' ||
            E'Hurmatli *' || escaped_patient_name || E'*,\n' ||
            E'Sizning *' || old_formatted_date || E'* kuni soat *' || old_formatted_time || 
            E'* dagi qabulingiz *' || formatted_date || E'* kuni soat *' || formatted_time || 
            E'* ga o''zgartirildi\\.\n\n' ||
            CASE 
              WHEN NEW.notes IS NOT NULL AND NEW.notes != '' THEN 
                E'Sabab: _' || escape_markdown_v2(NEW.notes) || E'_\n\n'
              ELSE 
                E'\n'
            END ||
            E'📍 _Iltimos, belgilangan vaqtda keling\\._'
          ELSE
            -- New appointment message
            E'⏰ *Yangi qabul*\n\n' ||
            E'Hurmatli *' || escaped_patient_name || E'*,\n' ||
            E'Sizning qabulingiz *' || escaped_dentist_name || E'* shifokor bilan *' || 
            formatted_date || E'* kuni soat *' || formatted_time || E'* da\\.\n\n' ||
            E'📍 _Iltimos, belgilangan vaqtda keling\\._'
        END,
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
        CASE 
          WHEN is_update THEN
            format(
              'Hurmatli %s, sizning %s kuni soat %s dagi qabulingiz %s kuni soat %s ga o''zgartirildi.%s',
              p.full_name,
              to_char(OLD.appointment_time, 'DD.MM.YYYY'),
              to_char(OLD.appointment_time, 'HH24:MI'),
              to_char(NEW.appointment_time, 'DD.MM.YYYY'),
              to_char(NEW.appointment_time, 'HH24:MI'),
              CASE 
                WHEN NEW.notes IS NOT NULL AND NEW.notes != '' THEN 
                  E'\nSabab: ' || NEW.notes
                ELSE 
                  ''
              END
            )
          ELSE
            format(
              'Hurmatli %s, sizning qabulingiz %s shifokor bilan %s kuni soat %s da belgilandi.',
              p.full_name,
              d.full_name,
              to_char(NEW.appointment_time, 'DD.MM.YYYY'),
              to_char(NEW.appointment_time, 'HH24:MI')
            )
        END,
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
        CASE 
          WHEN is_update THEN
            E'🔄 *Qabul vaqti o''zgartirildi*\n\n' ||
            E'Bemor: *' || escaped_patient_name || E'*\n' ||
            E'Eski vaqt: *' || old_formatted_date || E'* *' || old_formatted_time || E'*\n' ||
            E'Yangi vaqt: *' || formatted_date || E'* *' || formatted_time || E'*' ||
            CASE 
              WHEN NEW.notes IS NOT NULL AND NEW.notes != '' THEN 
                E'\nSabab: _' || escape_markdown_v2(NEW.notes) || E'_'
              ELSE 
                ''
            END
          ELSE
            E'⏰ *Yangi qabul*\n\n' ||
            E'Bemor: *' || escaped_patient_name || E'*\n' ||
            E'Sana: *' || formatted_date || E'*\n' ||
            E'Vaqt: *' || formatted_time || E'*'
        END,
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

-- Update default message templates with proper escaping
UPDATE dentists
SET message_templates = jsonb_build_object(
  'appointment', jsonb_build_object(
    'sms', jsonb_build_object(
      'new', jsonb_build_object(
        'uz', 'Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi. Telegram botimizga ulanib, barcha ma''lumotlarni ko''rishingiz mumkin: {{bot_link}}',
        'ru', 'Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}. Подключитесь к нашему Telegram боту, чтобы увидеть все данные: {{bot_link}}'
      ),
      'update', jsonb_build_object(
        'uz', 'Hurmatli {{patient_name}}, sizning {{old_date}} kuni soat {{old_time}} dagi qabulingiz {{date}} kuni soat {{time}} ga o''zgartirildi.{{reason}}',
        'ru', 'Уважаемый(ая) {{patient_name}}, ваш приём с {{old_date}} {{old_time}} перенесён на {{date}} {{time}}.{{reason}}'
      )
    ),
    'telegram', jsonb_build_object(
      'new', jsonb_build_object(
        'uz', E'⏰ *Yangi qabul*\n\nHurmatli *{{patient_name}}*,\nSizning qabulingiz *{{dentist_name}}* shifokor bilan *{{date}}* kuni soat *{{time}}* da\\.\n\n📍 _Iltimos, belgilangan vaqtda keling\\._',
        'ru', E'⏰ *Новый приём*\n\nУважаемый\\(ая\\) *{{patient_name}}*,\nВаш приём у врача *{{dentist_name}}* назначен на *{{date}}* в *{{time}}*\\.\n\n📍 _Пожалуйста, приходите в назначенное время\\._'
      ),
      'update', jsonb_build_object(
        'uz', E'🔄 *Qabul vaqti o''zgartirildi*\n\nHurmatli *{{patient_name}}*,\nSizning *{{old_date}}* kuni soat *{{old_time}}* dagi qabulingiz *{{date}}* kuni soat *{{time}}* ga o''zgartirildi\\.{{reason}}\n\n📍 _Iltimos, belgilangan vaqtda keling\\._',
        'ru', E'🔄 *Время приёма изменено*\n\nУважаемый\\(ая\\) *{{patient_name}}*,\nВаш приём с *{{old_date}}* *{{old_time}}* перенесён на *{{date}}* *{{time}}*\\.{{reason}}\n\n📍 _Пожалуйста, приходите в назначенное время\\._'
      )
    )
  )
);