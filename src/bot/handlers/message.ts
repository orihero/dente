import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { addressRequestMessage, invalidBirthdateMessage, registrationSuccessMessage } from '../messages.js';

export const handleMessage = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  const userState = stateManager.get(chatId);
  if (!userState || !userState.language) return;

  switch (userState.step) {
    case 'BIRTHDATE_REQUEST':
      await handleBirthdateInput(bot, msg, chatId, userState);
      break;

    case 'ADDRESS_REQUEST':
      await handleAddressInput(bot, msg, chatId, userState);
      break;
  }
};

async function handleBirthdateInput(bot: any, msg: Message, chatId: number, userState: any) {
  // Validate birthdate format (DD.MM.YYYY)
  const birthdateMatch = msg.text?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!birthdateMatch) {
    bot.sendMessage(chatId, invalidBirthdateMessage[userState.language.code]);
    return;
  }

  const [_, day, month, year] = birthdateMatch;
  const birthdate = `${year}-${month}-${day}`;

  // Update registration data
  stateManager.update(chatId, {
    step: 'ADDRESS_REQUEST',
    registrationData: {
      ...userState.registrationData,
      birthdate
    }
  });

  // Request address
  bot.sendMessage(chatId, addressRequestMessage[userState.language.code]);
}

async function handleAddressInput(bot: any, msg: Message, chatId: number, userState: any) {
  if (!msg.text) return;

  try {
    // Get all dentists with telegram bot enabled
    const { data: dentists, error: dentistsError } = await supabase
      .from('dentists')
      .select('id')
      .eq('telegram_bot_registered', true)
      .order('created_at');

    if (dentistsError) throw dentistsError;

    // If no dentists found, send error message
    if (!dentists || dentists.length === 0) {
      const errorMessage = userState.language.code === 'uz'
        ? 'Kechirasiz, hozirda faol shifokorlar yo\'q. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Извините, в данный момент нет активных врачей. Пожалуйста, попробуйте позже.';

      bot.sendMessage(chatId, errorMessage);
      return;
    }

    // For now, assign to the first available dentist
    // TODO: Implement dentist selection logic
    const dentistId = dentists[0].id;

    // Create new patient
    const { data: patient, error: createError } = await supabase
      .from('patients')
      .insert({
        dentist_id: dentistId,
        full_name: userState.registrationData!.full_name,
        phone: userState.registrationData!.phone,
        birthdate: userState.registrationData!.birthdate,
        address: msg.text,
        telegram_chat_id: chatId.toString(),
        telegram_registered: true
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update user state
    stateManager.update(chatId, {
      step: 'REGISTERED'
    });

    // Send success message
    bot.sendMessage(chatId, registrationSuccessMessage[userState.language.code]);
  } catch (error) {
    console.error('Error creating patient:', error);
    const errorMessage = userState.language.code === 'uz'
      ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
      : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

    bot.sendMessage(chatId, errorMessage);
  }
}