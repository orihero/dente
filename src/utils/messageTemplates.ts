interface MessageTemplates {
  appointment: {
    sms: {
      uz: string;
      ru: string;
    };
    telegram: {
      uz: string;
      ru: string;
    };
  };
}

export const defaultMessageTemplates: MessageTemplates = {
  appointment: {
    sms: {
      uz: 'Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi. Telegram botimizga ulanib, barcha ma\'lumotlarni ko\'rishingiz mumkin: {{bot_link}}',
      ru: 'Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}. Подключитесь к нашему Telegram боту, чтобы увидеть все данные: {{bot_link}}'
    },
    telegram: {
      uz: 'Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi.',
      ru: 'Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}.'
    }
  }
};

export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  return Object.entries(variables).reduce(
    (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );
};