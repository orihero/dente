-- Create function to handle request notifications
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
    escaped_name := regexp_replace(dentist_data.full_name, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g');
    escaped_email := regexp_replace(dentist_data.email, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g');
    escaped_phone := regexp_replace(dentist_data.phone, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g');
    escaped_clinic_name_uz := CASE 
      WHEN dentist_data.name_uz IS NOT NULL THEN 
        regexp_replace(dentist_data.name_uz, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g')
      ELSE NULL
    END;
    escaped_clinic_name_ru := CASE 
      WHEN dentist_data.name_ru IS NOT NULL THEN 
        regexp_replace(dentist_data.name_ru, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g')
      ELSE NULL
    END;
    escaped_description := regexp_replace(NEW.description, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g');

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

    -- Create messages with proper escaping
    message_uz := E'🔔 *Yangi tizim so''rovi*\\n\\n' ||
      E'*Shifokor:* ' || escaped_name || E'\\n' ||
      E'*Email:* ' || escaped_email || E'\\n' ||
      E'*Telefon:* ' || escaped_phone || E'\\n' ||
      CASE 
        WHEN escaped_clinic_name_uz IS NOT NULL THEN 
          E'*Klinika:* ' || escaped_clinic_name_uz || E'\\n'
        ELSE 
          ''
      END ||
      E'*So''rov turi:* ' || regexp_replace(request_type_uz, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g') || E'\\n\\n' ||
      E'*Mazmuni:*\\n' || escaped_description;

    message_ru := E'🔔 *Новый системный запрос*\\n\\n' ||
      E'*Врач:* ' || escaped_name || E'\\n' ||
      E'*Email:* ' || escaped_email || E'\\n' ||
      E'*Телефон:* ' || escaped_phone || E'\\n' ||
      CASE 
        WHEN escaped_clinic_name_ru IS NOT NULL THEN 
          E'*Клиника:* ' || escaped_clinic_name_ru || E'\\n'
        ELSE 
          ''
      END ||
      E'*Тип запроса:* ' || regexp_replace(request_type_ru, '([_*\[\]()~`>#+=|{}.!-])', E'\\\\\\1', 'g') || E'\\n\\n' ||
      E'*Содержание:*\\n' || escaped_description;

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