import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { UserState } from './types.js';
import { welcomeMessage, mainMenuMessage, birthdateRequestMessage, addressRequestMessage, invalidBirthdateMessage, registrationSuccessMessage } from './messages.js';
import { languageKeyboard, contactKeyboard, contactRequestMessage } from './keyboards.js';
import { supabase } from './supabase.js';

// In-memory store for user states
const userStates = new Map<number, UserState>();

export const handleStart = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  
  // Check if this is a registration link
  const text = msg.text || '';
  const match = text.match(/\/start\s+(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/);
  
  if (match) {
    const registrationToken = match[1];
    
    try {
      // First check if this is a dentist registration token
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select('*')
        .eq('telegram_registration_token', registrationToken)
        .single();

      if (!dentistError && dentist) {
        // Update dentist with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('dentists')
          .update({
            telegram_bot_chat_id: chatId.toString(),
            telegram_bot_registered: true,
            telegram_registration_token: null
          })
          .eq('id', dentist.id);

        if (updateError) throw updateError;

        // Send welcome message
        const userState = userStates.get(chatId);
        await bot.sendMessage(
          chatId,
          userState?.language?.code === 'uz' 
            ? `Xush kelibsiz, ${dentist.full_name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`
            : `Добро пожаловать, ${dentist.full_name}! Вы успешно зарегистрировались.`
        );
        return;
      }

      // If not a dentist token, check if it's a patient token
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('telegram_registration_token', registrationToken)
        .single();

      if (!patientError && patient) {
        // Update patient with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            telegram_chat_id: chatId.toString(),
            telegram_registered: true,
            telegram_registration_token: null
          })
          .eq('id', patient.id);

        if (updateError) throw updateError;

        // Send welcome message with main menu
        const userState = userStates.get(chatId);
        await bot.sendMessage(chatId, mainMenuMessage[userState?.language?.code || 'uz']);
        return;
      }
    } catch (error) {
      console.error('Error handling registration:', error);
    }
  }

  // Initialize user state
  userStates.set(chatId, {
    chatId,
    step: 'LANGUAGE_SELECTION'
  });

  // Send welcome message with language selection
  bot.sendMessage(chatId, 'Tilni tanlang / Выберите язык:', {
    parse_mode: 'MarkdownV2',
    reply_markup: languageKeyboard
  });
};

export const handleLanguageSelection = async (bot: any, query: CallbackQuery) => {
  if (!query.message || !query.data) return;
  
  const chatId = query.message.chat.id;
  const languageCode = query.data.split('_')[1] as 'uz' | 'ru';
  
  // Update user state
  const userState = userStates.get(chatId);
  if (!userState) return;
  
  userState.language = {
    code: languageCode,
    label: languageCode === 'uz' ? 'O\'zbekcha' : 'Русский',
    flag: languageCode === 'uz' ? '🇺🇿' : '🇷🇺'
  };
  userState.step = 'CONTACT_REQUEST';
  userStates.set(chatId, userState);

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

export const handleContact = async (bot: any, msg: Message) => {
  if (!msg.contact) return;
  
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  if (!userState || !userState.language) return;
  
  // Update user state with contact info
  userState.phone = msg.contact.phone_number;
  userState.name = msg.contact.first_name;
  userStates.set(chatId, userState);

  try {
    // Check if this phone number is associated with any patient
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', userState.phone);

    if (error) throw error;

    // If patient found
    if (patients && patients.length > 0) {
      const patient = patients[0];
      
      // Update patient with telegram chat ID
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_registered: true
        })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      // Send confirmation message
      const confirmationMessage = userState.language.code === 'uz'
        ? `✅ Rahmat! Siz muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nIsm: ${patient.full_name}`
        : `✅ Спасибо! Вы успешно зарегистрировались!\n\nИмя: ${patient.full_name}`;

      bot.sendMessage(chatId, confirmationMessage, {
        reply_markup: { remove_keyboard: true }
      });
    } else {
      // Start registration process
      userState.step = 'BIRTHDATE_REQUEST';
      userState.registrationData = {
        full_name: msg.contact.first_name + (msg.contact.last_name ? ' ' + msg.contact.last_name : ''),
        phone: msg.contact.phone_number
      };
      userStates.set(chatId, userState);

      // Request birthdate
      bot.sendMessage(chatId, birthdateRequestMessage[userState.language.code], {
        reply_markup: { remove_keyboard: true }
      });
    }
  } catch (error) {
    console.error('Error handling contact:', error);
    
    // Send error message
    const errorMessage = userState.language.code === 'uz'
      ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
      : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

    bot.sendMessage(chatId, errorMessage, {
      reply_markup: { remove_keyboard: true }
    });
  }
};

export const handleMessage = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  const userState = userStates.get(chatId);
  if (!userState || !userState.language) return;

  switch (userState.step) {
    case 'BIRTHDATE_REQUEST':
      // Validate birthdate format (DD.MM.YYYY)
      const birthdateMatch = msg.text?.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      if (!birthdateMatch) {
        bot.sendMessage(chatId, invalidBirthdateMessage[userState.language.code]);
        return;
      }

      const [_, day, month, year] = birthdateMatch;
      const birthdate = `${year}-${month}-${day}`;

      // Update registration data
      userState.registrationData!.birthdate = birthdate;
      userState.step = 'ADDRESS_REQUEST';
      userStates.set(chatId, userState);

      // Request address
      bot.sendMessage(chatId, addressRequestMessage[userState.language.code]);
      break;

    case 'ADDRESS_REQUEST':
      if (!msg.text) return;

      try {
        // Get dentist ID from the registration token
        const { data: dentist } = await supabase
          .from('dentists')
          .select('id')
          .eq('telegram_bot_chat_id', chatId.toString())
          .single();

        // Create new patient
        const { data: patient, error: createError } = await supabase
          .from('patients')
          .insert({
            dentist_id: dentist?.id,
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
        userState.step = 'REGISTERED';
        userStates.set(chatId, userState);

        // Send success message
        bot.sendMessage(chatId, registrationSuccessMessage[userState.language.code]);
      } catch (error) {
        console.error('Error creating patient:', error);
        const errorMessage = userState.language.code === 'uz'
          ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
          : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

        bot.sendMessage(chatId, errorMessage);
      }
      break;
  }
};