import { CallbackQuery } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu.js';
import { escape_markdown_v2 } from '../utils/formatters.js';

export const handleLanguageSelection = async (bot: any, query: CallbackQuery) => {
  if (!query.message || !query.data) return;
  
  const chatId = query.message.chat.id;
  const languageCode = query.data.split('_')[1] as 'uz' | 'ru';
  
  try {
    // Update patient's language preference in database
    const { error: updateError } = await supabase
      .from('patients')
      .update({ 
        language: languageCode,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_chat_id', chatId.toString());

    if (updateError) throw updateError;

    // Send confirmation message in selected language
    await bot.editMessageText(
      escape_markdown_v2(
        languageCode === 'uz'
          ? `✅ Til o'zbekchaga o'zgartirildi`
          : '✅ Язык изменён на русский'
      ),
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'MarkdownV2'
      }
    );

    // Send main menu with updated language
    await bot.sendMessage(
      chatId,
      escape_markdown_v2(
        languageCode === 'uz' 
          ? '🏥 Asosiy menyu' 
          : '🏥 Главное меню'
      ),
      {
        parse_mode: 'MarkdownV2',
        reply_markup: getMainMenuKeyboard(languageCode)
      }
    );

    // Answer callback query
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error updating language preference:', error);
    
    // Send error message
    await bot.sendMessage(
      chatId,
      escape_markdown_v2(
        languageCode === 'uz'
          ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
          : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
      ),
      { parse_mode: 'MarkdownV2' }
    );

    // Answer callback query with error
    await bot.answerCallbackQuery(query.id, {
      text: languageCode === 'uz'
        ? 'Xatolik yuz berdi'
        : 'Произошла ошибка',
      show_alert: true
    });
  }
};