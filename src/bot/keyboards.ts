import { InlineKeyboardButton } from 'node-telegram-bot-api';
import { menuTranslations } from './i18n/translations/menu.js';

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
    keyboard: [
      [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  },
  ru: {
    keyboard: [
      [{ text: '📱 Отправить номер телефона', request_contact: true }]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  }
};

export const newUserMenuKeyboard = {
  uz: {
    keyboard: [
      [{ text: '🏥 Klinika tanlash' }]
    ],
    resize_keyboard: true
  },
  ru: {
    keyboard: [
      [{ text: '🏥 Выбор клиники' }]
    ],
    resize_keyboard: true
  }
};

// Export keyboard getter function
export const getNewUserMenuKeyboard = (language: 'uz' | 'ru') => ({
  keyboard: newUserMenuKeyboard[language].keyboard,
  resize_keyboard: true
});

export const mainMenuKeyboard = {
  uz: {
    keyboard: [
      [
        { text: menuTranslations.uz.mainMenu.myDoctor },
        { text: menuTranslations.uz.mainMenu.myRecords }
      ],
      [
        { text: menuTranslations.uz.mainMenu.myAppointments },
        { text: menuTranslations.uz.mainMenu.myFamily }
      ],
      [
        { text: menuTranslations.uz.mainMenu.myBonuses },
        { text: menuTranslations.uz.mainMenu.settings }
      ]
    ],
    resize_keyboard: true
  },
  ru: {
    keyboard: [
      [
        { text: menuTranslations.ru.mainMenu.myDoctor },
        { text: menuTranslations.ru.mainMenu.myRecords }
      ],
      [
        { text: menuTranslations.ru.mainMenu.myAppointments },
        { text: menuTranslations.ru.mainMenu.myFamily }
      ],
      [
        { text: menuTranslations.ru.mainMenu.myBonuses },
        { text: menuTranslations.ru.mainMenu.settings }
      ]
    ],
    resize_keyboard: true
  }
};

export const settingsKeyboard = {
  uz: {
    keyboard: [
      [
        { text: menuTranslations.uz.settings.changeLanguage },
        { text: menuTranslations.uz.settings.referralProgram }
      ],
      [{ text: menuTranslations.uz.settings.back }]
    ],
    resize_keyboard: true
  },
  ru: {
    keyboard: [
      [
        { text: menuTranslations.ru.settings.changeLanguage },
        { text: menuTranslations.ru.settings.referralProgram }
      ],
      [{ text: menuTranslations.ru.settings.back }]
    ],
    resize_keyboard: true
  }
};