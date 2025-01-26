-- Add message_templates column to dentists table
ALTER TABLE dentists
ADD COLUMN IF NOT EXISTS message_templates jsonb DEFAULT jsonb_build_object(
  'appointment', jsonb_build_object(
    'sms', jsonb_build_object(
      'uz', 'Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi. Telegram botimizga ulanib, barcha ma''lumotlarni ko''rishingiz mumkin: {{bot_link}}',
      'ru', 'Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}. Подключитесь к нашему Telegram боту, чтобы увидеть все данные: {{bot_link}}'
    ),
    'telegram', jsonb_build_object(
      'uz', 'Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi.',
      'ru', 'Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}.'
    )
  )
);

-- Add comment to explain the column
COMMENT ON COLUMN dentists.message_templates IS 'Message templates for various notifications in different languages';

-- Create index for better query performance when accessing message templates
CREATE INDEX IF NOT EXISTS dentists_message_templates_idx ON dentists USING gin(message_templates);