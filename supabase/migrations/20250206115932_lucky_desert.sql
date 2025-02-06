-- Update appointment reminder function to respect patient's language preference
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
  inline_keyboard jsonb;
  patient_language text;
  message text;
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

    -- Get patient's language preference
    SELECT COALESCE(language, 'uz') INTO patient_language
    FROM patients
    WHERE id = NEW.patient_id;

    -- Escape special characters for Telegram Markdown V2
    escaped_patient_name := escape_markdown_v2(
      (SELECT full_name FROM patients WHERE id = NEW.patient_id)
    );
    
    escaped_dentist_name := escape_markdown_v2(
      (SELECT full_name FROM dentists WHERE id = NEW.dentist_id)
    );
    
    -- Format new date and time
    formatted_date := escape_markdown_v2(to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'));
    formatted_time := escape_markdown_v2(to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'));

    -- Format old date and time if this is an update
    IF is_update THEN
      old_formatted_date := escape_markdown_v2(to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'));
      old_formatted_time := escape_markdown_v2(to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'));
    END IF;

    -- Create inline keyboard based on patient's language
    inline_keyboard := jsonb_build_object(
      'inline_keyboard', jsonb_build_array(
        jsonb_build_array(
          jsonb_build_object(
            'text', CASE patient_language
              WHEN 'uz' THEN '✅ Tasdiqlash'
              ELSE '✅ Подтвердить'
            END,
            'callback_data', format('confirm_%s', NEW.id)
          ),
          jsonb_build_object(
            'text', CASE patient_language
              WHEN 'uz' THEN '❌ Bekor qilish'
              ELSE '❌ Отменить'
            END,
            'callback_data', format('cancel_%s', NEW.id)
          ),
          jsonb_build_object(
            'text', CASE patient_language
              WHEN 'uz' THEN '🔄 Qayta rejalashtirish'
              ELSE '🔄 Перенести'
            END,
            'callback_data', format('reschedule_%s', NEW.id)
          )
        )
      )
    );

    -- Create notification for patient
    IF EXISTS (
      SELECT 1 FROM patients
      WHERE id = NEW.patient_id
      AND telegram_registered = true
      AND telegram_chat_id IS NOT NULL
    ) THEN
      -- Create message based on patient's language
      message := CASE patient_language
        WHEN 'uz' THEN
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
          END
        ELSE
          CASE 
            WHEN is_update THEN
              -- Update message with old and new times
              E'🔄 *Время приёма изменено*\n\n' ||
              E'Уважаемый\\(ая\\) *' || escaped_patient_name || E'*,\n' ||
              E'Ваш приём с *' || old_formatted_date || E'* *' || old_formatted_time || 
              E'* перенесён на *' || formatted_date || E'* *' || formatted_time || 
              E'*\\.\n\n' ||
              CASE 
                WHEN NEW.notes IS NOT NULL AND NEW.notes != '' THEN 
                  E'Причина: _' || escape_markdown_v2(NEW.notes) || E'_\n\n'
                ELSE 
                  E'\n'
              END ||
              E'📍 _Пожалуйста, приходите в назначенное время\\._'
            ELSE
              -- New appointment message
              E'⏰ *Новый приём*\n\n' ||
              E'Уважаемый\\(ая\\) *' || escaped_patient_name || E'*,\n' ||
              E'Ваш приём у врача *' || escaped_dentist_name || E'* назначен на *' || 
              formatted_date || E'* в *' || formatted_time || E'*\\.\n\n' ||
              E'📍 _Пожалуйста, приходите в назначенное время\\._'
          END
      END;

      -- Schedule single Telegram notification in patient's language
      INSERT INTO notifications (
        type,
        status,
        recipient,
        message,
        metadata,
        created_at
      )
      SELECT
        'telegram',
        'pending',
        p.telegram_chat_id,
        message,
        inline_keyboard,
        reminder_time
      FROM patients p
      WHERE p.id = NEW.patient_id;
    ELSE
      -- Schedule SMS notification in patient's language
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
        CASE patient_language
          WHEN 'uz' THEN
            CASE 
              WHEN is_update THEN
                format(
                  'Hurmatli %s, sizning %s kuni soat %s dagi qabulingiz %s kuni soat %s ga o''zgartirildi.%s',
                  p.full_name,
                  to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'),
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
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI')
                )
            END
          ELSE
            CASE 
              WHEN is_update THEN
                format(
                  'Уважаемый(ая) %s, ваш приём с %s %s перенесён на %s %s.%s',
                  p.full_name,
                  to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(OLD.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI'),
                  CASE 
                    WHEN NEW.notes IS NOT NULL AND NEW.notes != '' THEN 
                      E'\nПричина: ' || NEW.notes
                    ELSE 
                      ''
                  END
                )
              ELSE
                format(
                  'Уважаемый(ая) %s, ваш приём у врача %s назначен на %s в %s.',
                  p.full_name,
                  d.full_name,
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'DD.MM.YYYY'),
                  to_char(NEW.appointment_time AT TIME ZONE 'Asia/Tashkent', 'HH24:MI')
                )
            END
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

-- Add comment
COMMENT ON FUNCTION schedule_appointment_reminders IS 'Schedules appointment reminders in patient''s preferred language';