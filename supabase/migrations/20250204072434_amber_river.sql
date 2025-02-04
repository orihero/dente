-- Create function to handle request notifications
CREATE OR REPLACE FUNCTION handle_request_notification()
RETURNS trigger AS $$
DECLARE
  dentist_data record;
  group_chat_id text;
  message_uz text;
  message_ru text;
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
    -- Create messages
    message_uz := format(
      '🔔 *Yangi tizim so''rovi*\n\n' ||
      '*Shifokor:* %s\n' ||
      '*Email:* %s\n' ||
      '*Telefon:* %s\n' ||
      CASE 
        WHEN dentist_data.name_uz IS NOT NULL THEN 
          '*Klinika:* ' || dentist_data.name_uz || E'\n'
        ELSE 
          ''
      END ||
      '*So''rov turi:* %s\n\n' ||
      '*Mazmuni:*\n%s',
      dentist_data.full_name,
      dentist_data.email,
      dentist_data.phone,
      CASE NEW.type
        WHEN 'feature' THEN 'Yangi funksiya'
        WHEN 'bug' THEN 'Xatolik'
        WHEN 'suggestion' THEN 'Taklif'
        WHEN 'support' THEN 'Yordam'
        ELSE NEW.type
      END,
      NEW.description
    );

    message_ru := format(
      '🔔 *Новый системный запрос*\n\n' ||
      '*Врач:* %s\n' ||
      '*Email:* %s\n' ||
      '*Телефон:* %s\n' ||
      CASE 
        WHEN dentist_data.name_ru IS NOT NULL THEN 
          '*Клиника:* ' || dentist_data.name_ru || E'\n'
        ELSE 
          ''
      END ||
      '*Тип запроса:* %s\n\n' ||
      '*Содержание:*\n%s',
      dentist_data.full_name,
      dentist_data.email,
      dentist_data.phone,
      CASE NEW.type
        WHEN 'feature' THEN 'Новая функция'
        WHEN 'bug' THEN 'Ошибка'
        WHEN 'suggestion' THEN 'Предложение'
        WHEN 'support' THEN 'Поддержка'
        ELSE NEW.type
      END,
      NEW.description
    );

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