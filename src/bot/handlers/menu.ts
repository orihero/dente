import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { menuTranslations } from '../i18n/translations/menu.js';
import { handleAppointments } from './appointments.js';
import { handleRecords } from './records.js';
import { handleRequests } from './requests.js';
import { mainMenuKeyboard, settingsKeyboard, languageKeyboard } from '../keyboards.js';
import { escape_markdown_v2 } from '../utils/formatters.js';

// Export keyboard getter for other modules
export const getMainMenuKeyboard = (language: 'uz' | 'ru') => mainMenuKeyboard[language];

export const handleMenu = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  try {
    // First get dentist data to determine language
    const { data: dentist, error: dentistError } = await supabase
      .from('dentists')
      .select('*, clinic_id, language')
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (dentistError) throw dentistError;
    if (!dentist) {
      console.error('No dentist found for chat ID:', chatId);
      return;
    }

    const t = menuTranslations[dentist.language || 'uz'];

    // Handle menu options
    switch (text) {
      case t.mainMenu.myRequests:
        await handleRequests(bot, chatId, dentist);
        break;

      // ... (keep all other existing cases)

      default:
        // Handle other menu options
        break;
    }
  } catch (error) {
    console.error('Error handling menu:', error);
    await bot.sendMessage(
      chatId,
      msg.from?.language_code === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};