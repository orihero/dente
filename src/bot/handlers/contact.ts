import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard, getNewUserMenuKeyboard } from './menu/index.js';
import { welcomeTranslations } from '../i18n/translations/welcome.js';

export const handleContact = async (bot: any, msg: Message) => {
  if (!msg.contact) return;
  
  const chatId = msg.chat.id;
  console.log('📱 Contact handler called for chat ID:', chatId);
  
  if (!msg.contact) return;
  
  const userState = stateManager.get(chatId);
  if (!userState || !userState.language) {
    console.log('❌ No user state or language found for chat ID:', chatId);
    return;
  }
  
  console.log('👤 Current user state:', userState);
  const t = translations[userState.language.code].registration;

  try {
    // If we have a registration token, update existing patient/dentist
    if (userState.registrationToken) {
      console.log('🔑 Found registration token:', userState.registrationToken);
      // First check if this is a dentist registration token
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select('*')
        .eq('telegram_registration_token', userState.registrationToken)
        .single();

      if (!dentistError && dentist) {
        console.log('✅ Found dentist:', dentist.id);
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
        await bot.sendMessage(
          chatId,
          userState.language.code === 'uz' 
            ? `Xush kelibsiz, ${dentist.full_name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`
            : `Добро пожаловать, ${dentist.full_name}! Вы успешно зарегистрировались.`,
          { reply_markup: getMainMenuKeyboard(userState.language.code) }
        );
        return;
      }

      // If not a dentist token, check if it's a patient token
      console.log('👥 Checking if patient token...');
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('telegram_registration_token', userState.registrationToken)
        .single();

      if (!patientError && patient) {
        console.log('✅ Found patient:', patient.id);
        // Update patient with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            telegram_chat_id: chatId.toString(),
            telegram_registered: true,
            telegram_registration_token: null,
            language: userState.language.code
          })
          .eq('id', patient.id);

        if (updateError) throw updateError;

        // Send welcome message with main menu
        await bot.sendMessage(
          chatId,
          userState.language.code === 'uz'
            ? `Xush kelibsiz, ${patient.full_name}!`
            : `Добро пожаловать, ${patient.full_name}!`,
          { reply_markup: getMainMenuKeyboard(userState.language.code) }
        );
        return;
      }

      console.log('❌ No matching token found');
    }

    // If no registration token or token not found, proceed with normal registration
    console.log('👤 Starting normal registration flow');
    // Check if this phone number is associated with any patient
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', msg.contact.phone_number);

    if (error) throw error;

    // If patient found
    if (patients && patients.length > 0) {
      console.log('✅ Found existing patient:', patients[0].id);
      const patient = patients[0];
      
      // Update patient with telegram chat ID
      const { error: updateError } = await supabase
        .from('patients')
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_registered: true,
          language: userState.language.code
        })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      // Send confirmation message
      const confirmationMessage = userState.language.code === 'uz'
        ? `✅ Rahmat! Siz muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nIsm: ${patient.full_name}`
        : `✅ Спасибо! Вы успешно зарегистрировались!\n\nИмя: ${patient.full_name}`;

      // Send welcome message with new user menu
      await bot.sendMessage(
        chatId,
        welcomeTranslations[userState.language.code].newUserWelcome(patient.full_name),
        { 
          parse_mode: 'MarkdownV2',
          reply_markup: getNewUserMenuKeyboard(userState.language.code)
        }
      );
    } else {
      console.log('👤 Starting new patient registration');
      // Start registration process
      userState.step = 'BIRTHDATE_REQUEST';
      userState.registrationData = {
        full_name: msg.contact.first_name + (msg.contact.last_name ? ' ' + msg.contact.last_name : ''),
        phone: msg.contact.phone_number
      };
      stateManager.set(chatId, userState);

      // Request birthdate
      await bot.sendMessage(
        chatId,
        translations[userState.language.code].registration.birthdateRequest,
        { reply_markup: { remove_keyboard: true } }
      );
    }
  } catch (error) {
    console.error('❌ Error handling contact:', error);
    
    // Send error message
    const errorMessage = userState.language.code === 'uz'
      ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
      : 'Произошла ошибка. Пожалуйста, попробуйте позже.';

    await bot.sendMessage(
      chatId,
      errorMessage,
      { reply_markup: { remove_keyboard: true } }
    );
  }
};