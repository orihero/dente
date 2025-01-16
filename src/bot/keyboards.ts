import { InlineKeyboardButton } from 'node-telegram-bot-api';

export const languageKeyboard = {
  inline_keyboard: [
    [
      { text: '🇺🇿 O\'zbekcha', callback_data: 'language_uz' },
      { text: '🇷🇺 Русский', callback_data: 'language_ru' }
    ]
  ]
};

export const contactKeyboard = {
  uz: {
    keyboard: [[{ text: '📱 Telefon raqamni yuborish', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true
  },
  ru: {
    keyboard: [[{ text: '📱 Отправить номер телефона', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

export const mainMenuKeyboard = {
  uz: {
    keyboard: [
      [{ text: '👨‍⚕️ Shifokorlar' }],
      [{ text: '🏥 Mening shifokorim' }],
      [{ text: '⚙️ Sozlamalar' }]
    ],
    resize_keyboard: true
  },
  ru: {
    keyboard: [
      [{ text: '👨‍⚕️ Врачи' }],
      [{ text: '🏥 Мой врач' }],
      [{ text: '⚙️ Настройки' }]
    ],
    resize_keyboard: true
  }
};

export const settingsKeyboard = {
  uz: {
    inline_keyboard: [
      [{ text: '🌐 Tilni o\'zgartirish', callback_data: 'change_language' }],
      [{ text: '🔗 Referal havola', callback_data: 'referral_link' }]
    ]
  },
  ru: {
    inline_keyboard: [
      [{ text: '🌐 Изменить язык', callback_data: 'change_language' }],
      [{ text: '🔗 Реферальная ссылка', callback_data: 'referral_link' }]
    ]
  }
};

export const contactRequestMessage = {
  uz: '📱 Iltimos, telefon raqamingizni yuboring.\n\nPastdagi "Telefon raqamni yuborish" tugmasini bosing.',
  ru: '📱 Пожалуйста, отправьте свой номер телефона.\n\nНажмите кнопку "Отправить номер телефона" ниже.'
};