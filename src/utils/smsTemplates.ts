interface SMSTemplates {
  recordCreated: {
    uz: string;
    ru: string;
  };
}

export const smsTemplates: SMSTemplates = {
  recordCreated: {
    uz: 'Hurmatli {{name}}, sizning tibbiy yozuvingiz yaratildi. Telegram botimizga ulanib, barcha ma\'lumotlarni ko\'rishingiz mumkin: {{link}}',
    ru: 'Уважаемый(ая) {{name}}, создана ваша медицинская запись. Подключитесь к нашему Telegram боту, чтобы увидеть все данные: {{link}}'
  }
};