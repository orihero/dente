import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { languageKeyboard } from '../keyboards.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu.js';

export const handleStart = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  
  // Check if this is a referral link
  const text = msg.text || '';
  const match = text.match(/\/start\s+(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/);
  
  // First check if user is already registered
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('*')
    .eq('telegram_chat_id', chatId.toString())
    .maybeSingle();

  if (existingPatient) {
    // User is already registered, send welcome back message
    await bot.sendMessage(
      chatId,
      existingPatient.language === 'uz'
        ? `Xush kelibsiz, ${existingPatient.full_name}!`
        : `Добро пожаловать, ${existingPatient.full_name}!`,
      { 
        reply_markup: getMainMenuKeyboard(existingPatient.language || 'uz')
      }
    );
    return;
  }

  // Initialize user state
  stateManager.set(chatId, {
    chatId,
    step: 'LANGUAGE_SELECTION',
    dentistId: match ? match[1] : undefined // Store dentist ID if referral link
  });

  // Send welcome message with language selection
  await bot.sendMessage(
    chatId,
    'Tilni tanlang / Выберите язык:',
    {
      parse_mode: 'MarkdownV2',
      reply_markup: languageKeyboard
    }
  );
};