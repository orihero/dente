-- Add recipe sending function
CREATE OR REPLACE FUNCTION send_record_recipe(record_id uuid)
RETURNS void AS $$
DECLARE
  record_data record;
  patient_data record;
  dentist_data record;
  message_uz text;
  message_ru text;
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

  -- Create messages
  message_uz := '🦷 *Tibbiy yozuv*\n\n' ||
                'Hurmatli *' || patient_data.full_name || '*,\n' ||
                '*' || dentist_data.full_name || '* shifokor tomonidan *' || 
                to_char(record_data.created_at, 'DD.MM.YYYY') || '* sanasida belgilangan davolanish bo''yicha ma''lumot:\n\n' ||
                '*Tashxis:*\n' || record_data.diagnosis;

  message_ru := '🦷 *Медицинская запись*\n\n' ||
                'Уважаемый\\(ая\\) *' || patient_data.full_name || '*,\n' ||
                'Информация о лечении, назначенном врачом *' || dentist_data.full_name || '* *' || 
                to_char(record_data.created_at, 'DD.MM.YYYY') || '*:\n\n' ||
                '*Диагноз:*\n' || record_data.diagnosis;

  -- Add recipe if exists
  IF record_data.recipe IS NOT NULL AND record_data.recipe != '' THEN
    message_uz := message_uz || '\n\n*Dori\\-darmonlar:*\n' || record_data.recipe;
    message_ru := message_ru || '\n\n*Лекарства:*\n' || record_data.recipe;
  END IF;

  -- Add suggestions if exists
  IF record_data.suggestions IS NOT NULL AND record_data.suggestions != '' THEN
    message_uz := message_uz || '\n\n*Tavsiyalar:*\n' || record_data.suggestions;
    message_ru := message_ru || '\n\n*Рекомендации:*\n' || record_data.suggestions;
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_record_recipe TO authenticated;