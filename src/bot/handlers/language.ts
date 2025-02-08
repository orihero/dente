import { CallbackQuery } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu/index.js';
import { getNewUserMenuKeyboard } from '../keyboards.js';
import { welcomeMessage } from '../messages.js';
import { contactKeyboard } from '../keyboards.js';
import { welcomeTranslations } from '../i18n/translations/welcome.js';

export const handleLanguageSelection = async (bot: any, query: CallbackQuery) => {
  if (!query.message || !query.data) return;
  
  const chatId = query.message.chat.id;
  const languageCode = query.data.split('_')[1] as 'uz' | 'ru';
  
  console.log('🌐 Language selection handler called:', { chatId, languageCode });
  
  try {
    // First check if user is already registered
    console.log('👤 Checking if user is already registered...');
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        dentist:dentists(
          id,
          full_name
        )
      `)
      .eq('telegram_chat_id', chatId.toString())
      .eq('telegram_registered', true)
      .single();

    if (patientError && patientError.code !== 'PGRST116') {
      throw patientError;
    }

    if (patient) {
      console.log('✅ Found registered patient, updating language...');
      // Update patient's language preference
      const { error: updateError } = await supabase
        .from('patients')
        .update({ language: languageCode })
        .eq('id', patient.id);

      if (updateError) throw updateError;

      // Send confirmation message
      await bot.editMessageText(
        languageCode === 'uz'
          ? '✅ Til o\'zbekchaga o\'zgartirildi'
          : '✅ Язык изменён на русский',
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'MarkdownV2'
        }
      );

      // Send main menu with updated language
      await bot.sendMessage(
        chatId,
        languageCode === 'uz' ? '🏥 Asosiy menyu' : '🏥 Главное меню',
        {
          reply_markup: getMainMenuKeyboard(languageCode)
        }
      );

      return;
    }
    console.log('👨‍⚕️ Checking if user is a registered dentist...');
    const { data: dentist, error: dentistError } = await supabase
      .from('dentists')
      .select('*')
      .eq('telegram_bot_chat_id', chatId.toString())
      .eq('telegram_bot_registered', true)
      .single();

    if (dentistError && dentistError.code !== 'PGRST116') {
      throw dentistError;
    }

    if (dentist) {
      console.log('✅ Found registered dentist:', dentist.id);
      // Send confirmation message
      await bot.editMessageText(
        languageCode === 'uz'
          ? '✅ Til o\'zbekchaga o\'zgartirildi'
          : '✅ Язык изменён на русский',
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: 'MarkdownV2'
        }
      );

      // Send main menu with updated language
      await bot.sendMessage(
        chatId,
        languageCode === 'uz' ? '🏥 Asosiy menyu' : '🏥 Главное меню',
        {
          reply_markup: getMainMenuKeyboard(languageCode)
        }
      );

      return;
    }

    // Get current state for new users
    const userState = stateManager.get(chatId);
    if (!userState) {
      console.log('❌ No user state found for chat ID:', chatId);
      // Initialize new state
      stateManager.set(chatId, {
        chatId,
        step: 'LANGUAGE_SELECTION',
        language: {
          code: languageCode,
          label: languageCode === 'uz' ? 'O\'zbekcha' : 'Русский',
          flag: languageCode === 'uz' ? '🇺🇿' : '🇷🇺'
        }
      });
    } else {
      // Update existing state
      userState.language = {
        code: languageCode,
        label: languageCode === 'uz' ? 'O\'zbekcha' : 'Русский',
        flag: languageCode === 'uz' ? '🇺🇿' : '🇷🇺'
      };
      stateManager.set(chatId, userState);
    }

    // If we have a registration token, try to find existing user
    if (userState?.registrationToken) {
      console.log('🔑 Found registration token:', userState.registrationToken);
      // First check if this is a dentist registration token
      console.log('👨‍⚕️ Checking if dentist token...');
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

        // First edit the message text
        await bot.editMessageText(
          languageCode === 'uz' 
            ? `Xush kelibsiz, ${dentist.full_name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`
            : `Добро пожаловать, ${dentist.full_name}! Вы успешно зарегистрировались.`,
          {
            chat_id: chatId,
            message_id: query.message.message_id
          }
        );

        // Then send a new message with the keyboard
        await bot.sendMessage(
          chatId,
          languageCode === 'uz' ? '🏥 Asosiy menyu' : '🏥 Главное меню',
          {
            reply_markup: getMainMenuKeyboard(languageCode)
          }
        );
        return;
      }

      // If not a dentist token, check if it's a patient token
      console.log('👥 Checking if patient token...');
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('telegram_registration_token', userState.registrationToken)
        .single();

      if (!patientError && newPatient) {
        console.log('✅ Found patient:', newPatient.id);
        // Update patient with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            telegram_chat_id: chatId.toString(),
            telegram_registered: true,
            telegram_registration_token: null,
            language: languageCode
          })
          .eq('id', newPatient.id);

        if (updateError) throw updateError;

        // First edit the message text
        await bot.editMessageText(
          languageCode === 'uz'
            ? `Xush kelibsiz, ${newPatient.full_name}!`
            : `Добро пожаловать, ${newPatient.full_name}!`,
          {
            chat_id: chatId,
            message_id: query.message.message_id
          }
        );

        // Then send a new message with the keyboard
        await bot.sendMessage(
          chatId,
          welcomeTranslations[languageCode].newUserWelcome(newPatient.full_name),
          {
            parse_mode: 'MarkdownV2',
            reply_markup: getNewUserMenuKeyboard(languageCode)
          }
        );
        return;
      }

      console.log('❌ No matching token found');
    }

    // If no registration token or token not found, proceed with normal flow
    console.log('👤 Starting normal registration flow');
    userState.step = 'CONTACT_REQUEST';
    stateManager.set(chatId, userState);

    // First edit the welcome message
    await bot.editMessageText(
      welcomeMessage[languageCode],
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'MarkdownV2'
      }
    );

    // Then send a new message with the contact keyboard
    await bot.sendMessage(
      chatId,
      translations[languageCode].registration.contactRequest,
      {
        reply_markup: contactKeyboard[languageCode]
      }
    );
  } catch (error) {
    console.error('❌ Error handling language selection:', error);
    await bot.sendMessage(
      chatId,
      languageCode === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};