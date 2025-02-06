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

-- Update request notification function to properly handle escaping
CREATE OR REPLACE FUNCTION handle_request_notification()
RETURNS trigger AS $$
DECLARE
  dentist_data record;
  group_chat_id text;
  message_uz text;
  message_ru text;
  escaped_name text;
  escaped_email text;
  escaped_phone text;
  escaped_clinic_name_uz text;
  escaped_clinic_name_ru text;
  escaped_description text;
  request_type_uz text;
  request_type_ru text;
BEGIN
  -- Get dentist data
  SELECT d.*, c.name_uz, c.name_ru 
  INTO dentist_data
  FROM dentists d
  LEFT JOIN clinics c ON c.id = d.clinic_id
  WHERE d.id = NEW.dentist_id;

  -- Get group chat ID from project settings
  SELECT telegram_group_chat_id INTO group_chat_id
  FROM project_settings
  LIMIT 1;

  -- Only proceed if group chat ID is set
  IF group_chat_id IS NOT NULL THEN
    -- Escape all text fields
    escaped_name := escape_markdown_v2(dentist_data.full_name);
    escaped_email := escape_markdown_v2(dentist_data.email);
    escaped_phone := escape_markdown_v2(dentist_data.phone);
    escaped_clinic_name_uz := CASE 
      WHEN dentist_data.name_uz IS NOT NULL THEN 
        escape_markdown_v2(dentist_data.name_uz)
      ELSE NULL
    END;
    escaped_clinic_name_ru := CASE 
      WHEN dentist_data.name_ru IS NOT NULL THEN 
        escape_markdown_v2(dentist_data.name_ru)
      ELSE NULL
    END;
    escaped_description := escape_markdown_v2(NEW.description);

    -- Get request type labels
    request_type_uz := CASE NEW.type
      WHEN 'feature' THEN 'Yangi funksiya'
      WHEN 'bug' THEN 'Xatolik'
      WHEN 'suggestion' THEN 'Taklif'
      WHEN 'support' THEN 'Yordam'
      ELSE NEW.type
    END;
    request_type_ru := CASE NEW.type
      WHEN 'feature' THEN 'Новая функция'
      WHEN 'bug' THEN 'Ошибка'
      WHEN 'suggestion' THEN 'Предложение'
      WHEN 'support' THEN 'Поддержка'
      ELSE NEW.type
    END;

    -- Create messages with proper escaping and line breaks
    message_uz := E'🔔 *Yangi tizim so''rovi*\n\n' ||
      '*Shifokor:* ' || escaped_name || E'\n' ||
      '*Email:* ' || escaped_email || E'\n' ||
      '*Telefon:* ' || escaped_phone || E'\n' ||
      CASE 
        WHEN escaped_clinic_name_uz IS NOT NULL THEN 
          '*Klinika:* ' || escaped_clinic_name_uz || E'\n'
        ELSE 
          ''
      END ||
      '*So''rov turi:* ' || escape_markdown_v2(request_type_uz) || E'\n\n' ||
      '*Mazmuni:*\n' || escaped_description;

    message_ru := E'🔔 *Новый системный запрос*\n\n' ||
      '*Врач:* ' || escaped_name || E'\n' ||
      '*Email:* ' || escaped_email || E'\n' ||
      '*Телефон:* ' || escaped_phone || E'\n' ||
      CASE 
        WHEN escaped_clinic_name_ru IS NOT NULL THEN 
          '*Клиника:* ' || escaped_clinic_name_ru || E'\n'
        ELSE 
          ''
      END ||
      '*Тип запроса:* ' || escape_markdown_v2(request_type_ru) || E'\n\n' ||
      '*Содержание:*\n' || escaped_description;

    -- Insert notifications
    INSERT INTO notifications (type, status, recipient, message)
    VALUES 
      ('telegram', 'pending', group_chat_id, message_uz),
      ('telegram', 'pending', group_chat_id, message_ru);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for request notifications
DROP TRIGGER IF EXISTS request_notification_trigger ON dentist_requests;
CREATE TRIGGER request_notification_trigger
  AFTER INSERT ON dentist_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_request_notification();

-- Add comment
COMMENT ON FUNCTION handle_request_notification IS 'Sends notifications to Telegram group when a new request is created';