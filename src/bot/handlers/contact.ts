import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu.js';

export const handleContact = async (bot: any, msg: Message) => {
  if (!msg.contact) return;
  
  const chatId = msg.chat.id;
  const userState = stateManager.get(chatId);
  if (!userState || !userState.language) return;
  
  const t = translations[userState.language.code];

  try {
    // Check if this phone number is associated with any patient
    const { data: existingPatient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', msg.contact.phone_number)
      .maybeSingle();

    if (patientError && patientError.code !== 'PGRST116') {
      throw patientError;
    }

    if (existingPatient) {
      // Update existing patient with telegram info
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_registered: true
        })
        .eq('id', existingPatient.id);

      if (updateError) throw updateError;

      // Send welcome back message
      await bot.sendMessage(
        chatId,
        userState.language.code === 'uz'
          ? `Xush kelibsiz, ${existingPatient.full_name}!`
          : `Добро пожаловать, ${existingPatient.full_name}!`,
        { 
          parse_mode: 'MarkdownV2',
          reply_markup: getMainMenuKeyboard(userState.language.code)
        }
      );
    } else {
      // Start registration process for new patient
      stateManager.update(chatId, {
        step: 'BIRTHDATE_REQUEST',
        registrationData: {
          full_name: msg.contact.first_name + (msg.contact.last_name ? ' ' + msg.contact.last_name : ''),
          phone: msg.contact.phone_number
        }
      });

      // Request birthdate
      await bot.sendMessage(
        chatId,
        t.registration.birthdateRequest,
        { 
          parse_mode: 'MarkdownV2',
          reply_markup: { remove_keyboard: true }
        }
      );
    }
  } catch (error) {
    console.error('Error handling contact:', error);
  }
};