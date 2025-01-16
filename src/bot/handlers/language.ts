import { CallbackQuery } from 'node-telegram-bot-api';
import { stateManager } from '../services/state.js';
import { welcomeMessage } from '../messages.js';
import { contactKeyboard, contactRequestMessage } from '../keyboards.js';

export const handleLanguageSelection = async (bot: any, query: CallbackQuery) => {
  if (!query.message || !query.data) return;
  
  const chatId = query.message.chat.id;
  const languageCode = query.data.split('_')[1] as 'uz' | 'ru';
  
  // Update user state
  const userState = stateManager.get(chatId);
  if (!userState) return;
  
  stateManager.update(chatId, {
    language: {
      code: languageCode,
      label: languageCode === 'uz' ? 'O\'zbekcha' : 'Русский',
      flag: languageCode === 'uz' ? '🇺🇿' : '🇷🇺'
    },
    step: 'CONTACT_REQUEST'
  });

  // Send welcome message in selected language
  await bot.editMessageText(welcomeMessage[languageCode], {
    chat_id: chatId,
    message_id: query.message.message_id,
    parse_mode: 'MarkdownV2'
  });

  // Request contact
  await bot.sendMessage(chatId, contactRequestMessage[languageCode], {
    reply_markup: contactKeyboard[languageCode]
  });
};