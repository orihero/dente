import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { birthdateRequestMessage } from '../messages.js';

export const handleContact = async (bot: any, msg: Message) => {
  if (!msg.contact) return;
  
  const chatId = msg.chat.id;
  const userState = stateManager.get(chatId);
  if (!userState || !userState.language) return;

  try {
    // Check if this phone number is associated with any patient
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', msg.contact.phone_number);

    if (error) throw error;

    // If patient found
    if (patients && patients.length > 0) {
      await handleExistingPatient(bot, chatId, patients[0], userState.language.code);
    } else {
      await handleNewPatient(bot, chatId, msg.contact, userState);
    }
  } catch (error) {
    console.error('Error handling contact:', error);
    handleError(bot, chatId, userState.language.code);
  }
};

async function handleExistingPatient(bot: any, chatId: number, patient: any, language: string) {
  try {
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        telegram_chat_id: chatId.toString(),
        telegram_registered: true
      })
      .eq('id', patient.id);

    if (updateError) throw updateError;

    // Send confirmation message
    const confirmationMessage = language === 'uz'
      ? `✅ Rahmat! Siz muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nIsm: ${patient.full_name}`
      : `✅ Спасибо! Вы успешно зарегистрировались!\n\nИмя: ${patient.full_name}`;

    bot.sendMessage(chatId, confirmationMessage, {
      reply_markup: { remove_keyboard: true }
    });
  } catch (error) {
    console.error('Error updating existing patient:', error);
    throw error;
  }
}

async function handleNewPatient(bot: any, chatId: number, contact: any, userState: any) {
  // Start registration process
  stateManager.update(chatId, {
    step: 'BIRTHDATE_REQUEST',
    registrationData: {
      full_name: contact.first_name + (contact.last_name ? ' ' + contact.last_name : ''),
      phone: contact.phone_number
    }
  });

  // Request birthdate
  bot.sendMessage(chatId, birthdateRequestMessage[userState.language.code], {
    reply_markup: { remove_keyboard: true }
  });
}

function handleError(bot: any, chatId: number, language: string) {
  const errorMessage = language === 'uz'
    ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
    : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

  bot.sendMessage(chatId, errorMessage, {
    reply_markup: { remove_keyboard: true }
  });
}