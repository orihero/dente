-- Update record recipe function to use escape_markdown_v2
CREATE OR REPLACE FUNCTION send_record_recipe(record_id uuid)
RETURNS void AS $$
DECLARE
  record_data record;
  patient_data record;
  dentist_data record;
  message_uz text;
  message_ru text;
  escaped_patient_name text;
  escaped_dentist_name text;
  escaped_diagnosis text;
  escaped_recipe text;
  escaped_suggestions text;
  formatted_date text;
BEGIN
  -- Get record data with validation
  SELECT * INTO record_data
  FROM patient_records
  WHERE id = record_id
  AND EXISTS (
    SELECT 1 FROM dentists
    WHERE dentists.id = patient_records.dentist_id
    AND dentists.id = auth.uid()
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Record not found or permission denied';
  END IF;

  -- Get patient data
  SELECT * INTO patient_data
  FROM patients
  WHERE id = record_data.patient_id;

  IF NOT patient_data.telegram_registered THEN
    RAISE EXCEPTION 'Patient is not registered in Telegram';
  END IF;

  -- Get dentist data
  SELECT * INTO dentist_data
  FROM dentists
  WHERE id = record_data.dentist_id;

  -- Escape all text fields
  escaped_patient_name := escape_markdown_v2(patient_data.full_name);
  escaped_dentist_name := escape_markdown_v2(dentist_data.full_name);
  escaped_diagnosis := escape_markdown_v2(record_data.diagnosis);
  escaped_recipe := CASE WHEN record_data.recipe IS NOT NULL AND record_data.recipe != '' 
                      THEN escape_markdown_v2(record_data.recipe) 
                      ELSE NULL 
                    END;
  escaped_suggestions := CASE WHEN record_data.suggestions IS NOT NULL AND record_data.suggestions != '' 
                          THEN escape_markdown_v2(record_data.suggestions) 
                          ELSE NULL 
                        END;
  formatted_date := to_char(record_data.created_at, 'DD.MM.YYYY');

  -- Create messages
  message_uz := E'🦷 *Tibbiy yozuv*\n\n' ||
                E'Hurmatli *' || escaped_patient_name || E'*,\n' ||
                E'*' || escaped_dentist_name || E'* shifokor tomonidan *' || 
                formatted_date || E'* sanasida belgilangan davolanish bo''yicha ma''lumot:\n\n' ||
                E'*Tashxis:*\n' || escaped_diagnosis;

  message_ru := E'🦷 *Медицинская запись*\n\n' ||
                E'Уважаемый\\(ая\\) *' || escaped_patient_name || E'*,\n' ||
                E'Информация о лечении, назначенном врачом *' || escaped_dentist_name || E'* *' || 
                formatted_date || E'*:\n\n' ||
                E'*Диагноз:*\n' || escaped_diagnosis;

  -- Add recipe if exists
  IF escaped_recipe IS NOT NULL THEN
    message_uz := message_uz || E'\n\n*Dori\\-darmonlar:*\n' || escaped_recipe;
    message_ru := message_ru || E'\n\n*Лекарства:*\n' || escaped_recipe;
  END IF;

  -- Add suggestions if exists
  IF escaped_suggestions IS NOT NULL THEN
    message_uz := message_uz || E'\n\n*Tavsiyalar:*\n' || escaped_suggestions;
    message_ru := message_ru || E'\n\n*Рекомендации:*\n' || escaped_suggestions;
  END IF;

  -- Insert notifications
  INSERT INTO notifications (type, status, recipient, message)
  VALUES 
    ('telegram', 'pending', patient_data.telegram_chat_id, message_uz),
    ('telegram', 'pending', patient_data.telegram_chat_id, message_ru);

  -- Update recipe_sent status
  UPDATE patient_records
  SET recipe_sent = true
  WHERE id = record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;