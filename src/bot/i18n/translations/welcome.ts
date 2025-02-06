export const welcomeTranslations = {
  uz: {
    newUserWelcome: (name: string) =>
      `🦷 *Dente\\.uz \\- Stomatologiya boshqaruv tizimiga xush kelibsiz\\!*\n\n` +
      `Hurmatli *${name}*, siz muvaffaqiyatli ro'yxatdan o'tdingiz\\.\n\n` +
      `Iltimos, quyidagi amallardan birini tanlang:\n` +
      `1\\. Klinikani tanlash\n` +
      `2\\. Sozlamalar`,
    dentistWelcome: (name: string) => 
      `🦷 *Dente\\.uz \\- Stomatologiya boshqaruv tizimiga xush kelibsiz\\!*\n\n` +
      `Hurmatli *${name}*, siz muvaffaqiyatli ro'yxatdan o'tdingiz\\.\n\n` +
      `Endi siz:\n` +
      `✅ Qabullarni ko'rishingiz\n` +
      `✅ Bemorlar bilan bog'lanishingiz\n` +
      `✅ Eslatmalar olishingiz mumkin`,

    patientWelcome: (name: string) =>
      `🦷 *Dente\\.uz \\- Stomatologiya boshqaruv tizimiga xush kelibsiz\\!*\n\n` +
      `Hurmatli *${name}*, siz muvaffaqiyatli ro'yxatdan o'tdingiz\\.\n\n` +
      `Endi siz:\n` +
      `✅ Qabullaringizni ko'rishingiz\n` +
      `✅ Shifokor bilan bog'lanishingiz\n` +
      `✅ Eslatmalar olishingiz mumkin`,

    invitationRequired: 
      `🦷 *Dente\\.uz \\- Stomatologiya boshqaruv tizimi*\n\n` +
      `Kechirasiz, botdan foydalanish uchun shifokoringizdan maxsus havola olishingiz kerak\\.\n\n` +
      `Iltimos, shifokoringizga murojaat qiling va u sizga botga ulanish uchun havola yuboradi\\!`
  },
  ru: {
    newUserWelcome: (name: string) =>
      `🦷 *Dente\\.uz \\- Добро пожаловать в систему управления стоматологией\\!*\n\n` +
      `Уважаемый\\(ая\\) *${name}*, вы успешно зарегистрировались\\.\n\n` +
      `Пожалуйста, выберите одно из следующих действий:\n` +
      `1\\. Выбрать клинику\n` +
      `2\\. Настройки`,
    dentistWelcome: (name: string) =>
      `🦷 *Dente\\.uz \\- Добро пожаловать в систему управления стоматологией\\!*\n\n` +
      `Уважаемый(ая) *${name}*, вы успешно зарегистрировались\\.\n\n` +
      `Теперь вы можете:\n` +
      `✅ Просматривать приёмы\n` +
      `✅ Связываться с пациентами\n` +
      `✅ Получать напоминания`,

    patientWelcome: (name: string) =>
      `🦷 *Dente\\.uz \\- Добро пожаловать в систему управления стоматологией\\!*\n\n` +
      `Уважаемый(ая) *${name}*, вы успешно зарегистрировались\\.\n\n` +
      `Теперь вы можете:\n` +
      `✅ Просматривать ваши приёмы\n` +
      `✅ Связываться с врачом\n` +
      `✅ Получать напоминания`,

    invitationRequired:
      `🦷 *Dente\\.uz \\- Система управления стоматологией*\n\n` +
      `Извините, для использования бота вам нужно получить специальную ссылку от вашего врача\\.\n\n` +
      `Пожалуйста, обратитесь к вашему врачу, и он отправит вам ссылку для подключения к боту\\!`
  }
};