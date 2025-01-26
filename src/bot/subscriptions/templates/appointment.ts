export const appointmentTemplates = {
  newAppointment: {
    uz: (data: {
      patientName: string;
      dentistName: string;
      date: string;
      time: string;
      botLink?: string;
    }) => ({
      sms: `Hurmatli ${data.patientName}, sizning qabulingiz ${data.dentistName} shifokor bilan ${data.date} kuni soat ${data.time} da belgilandi. ${data.botLink ? `\n\nTelegram botimizga ulanib, barcha ma'lumotlarni ko'rishingiz mumkin: ${data.botLink}` : ''}`,
      telegram: `⏰ *Qabul eslatmasi*\n\nHurmatli *${data.patientName}*,\nSizning qabulingiz *${data.dentistName}* shifokor bilan *${data.date}* kuni soat *${data.time}* da\\.\n\n📍 _Iltimos, belgilangan vaqtda keling\\._`
    }),
    ru: (data: {
      patientName: string;
      dentistName: string;
      date: string;
      time: string;
      botLink?: string;
    }) => ({
      sms: `Уважаемый(ая) ${data.patientName}, ваш приём у врача ${data.dentistName} назначен на ${data.date} в ${data.time}. ${data.botLink ? `\n\nПодключитесь к нашему Telegram боту, чтобы увидеть все данные: ${data.botLink}` : ''}`,
      telegram: `⏰ *Напоминание о приёме*\n\nУважаемый\\(ая\\) *${data.patientName}*,\nВаш приём у врача *${data.dentistName}* назначен на *${data.date}* в *${data.time}*\\.\n\n📍 _Пожалуйста, приходите в назначенное время\\._`
    })
  },
  reminder: {
    uz: (data: {
      patientName: string;
      dentistName: string;
      date: string;
      time: string;
    }) => ({
      sms: `Hurmatli ${data.patientName}, eslatib o'tamiz: sizning qabulingiz ${data.dentistName} shifokor bilan ${data.date} kuni soat ${data.time} da.`,
      telegram: `⏰ *Qabul eslatmasi*\n\nHurmatli *${data.patientName}*,\nSizning qabulingiz *${data.dentistName}* shifokor bilan *${data.date}* kuni soat *${data.time}* da\\.\n\n📍 _Iltimos, belgilangan vaqtda keling\\._`
    }),
    ru: (data: {
      patientName: string;
      dentistName: string;
      date: string;
      time: string;
    }) => ({
      sms: `Уважаемый(ая) ${data.patientName}, напоминаем: ваш приём у врача ${data.dentistName} назначен на ${data.date} в ${data.time}.`,
      telegram: `⏰ *Напоминание о приёме*\n\nУважаемый\\(ая\\) *${data.patientName}*,\nВаш приём у врача *${data.dentistName}* назначен на *${data.date}* в *${data.time}*\\.\n\n📍 _Пожалуйста, приходите в назначенное время\\._`
    })
  }
};