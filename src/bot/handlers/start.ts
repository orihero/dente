import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { languageKeyboard } from '../keyboards.js';
import { translations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu/index.js';

export const handleStart = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  console.log('🚀 Start handler called for chat ID:', chatId);
  
  // First check if user is already registered
  console.log('👤 Checking if user is already registered...');
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('*')
    .eq('telegram_chat_id', chatId.toString())
    .maybeSingle();

  if (existingPatient) {
    console.log('✅ Found existing patient:', existingPatient.id);
    // User is already registered, send welcome back message
    await bot.sendMessage(
      chatId,
      existingPatient.language === 'uz'
        ? `Xush kelibsiz, ${existingPatient.full_name}!`
        : `Добро пожаловать, ${existingPatient.full_name}!`,
      { 
        reply_markup: {
          keyboard: getMainMenuKeyboard(existingPatient.language || 'uz').keyboard,
          resize_keyboard: true
        }
      }
    );
    return;
  }

  // Check if this is a registration link
  const text = msg.text || '';
  const match = text.match(/\/start\s+([^\/\s]+)/);
  
  if (match) {
    const referralId = match[1];
    console.log('🔑 Found registration token:', referralId);
    
    try {
      // First check if this is a dentist registration token
      console.log('👨‍⚕️ Checking if dentist token...');
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select('*')
        .eq('telegram_registration_token', referralId)
        .single();

      if (!dentistError && dentist) {
        console.log('✅ Found dentist:', dentist.id);
        // Initialize state with registration token
        stateManager.set(chatId, {
          chatId,
          step: 'LANGUAGE_SELECTION',
          registrationToken: referralId
        });

        // Send language selection
        await bot.sendMessage(
          chatId,
          'Tilni tanlang / Выберите язык:',
          {
            parse_mode: 'MarkdownV2',
            reply_markup: languageKeyboard
          }
        );
        return;
      }

      // If not a dentist token, check if it's a patient token
      console.log('👥 Checking if patient token...');
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('telegram_registration_token', referralId)
        .single();

      if (!patientError && patient) {
        console.log('✅ Found patient:', patient.id);
        // Initialize state with registration token
        stateManager.set(chatId, {
          chatId,
          step: 'LANGUAGE_SELECTION',
          registrationToken: referralId
        });

        // Send language selection
        await bot.sendMessage(
          chatId,
          'Tilni tanlang / Выберите язык:',
          {
            parse_mode: 'MarkdownV2',
            reply_markup: languageKeyboard
          }
        );
        return;
      }

      // If not a token, check if it's a referring patient
      console.log('👥 Checking if patient referral...');
      const { data: referringPatient, error: referralError } = await supabase
        .from('patients')
        .select(`
          *,
          dentist:dentists(
            id,
            telegram_bot_settings
          )
        `)
        .eq('id', referralId)
        .single();

      if (!referralError && referringPatient) {
        console.log('✅ Found referring patient:', referringPatient.id);
        // Initialize state with referrer info
        stateManager.set(chatId, {
          chatId,
          step: 'LANGUAGE_SELECTION',
          referredBy: referralId,
          dentistId: referringPatient.dentist.id,
          referralSettings: referringPatient.dentist.telegram_bot_settings?.referral
        });

        // Send language selection
        await bot.sendMessage(
          chatId,
          'Tilni tanlang / Выберите язык:',
          {
            parse_mode: 'MarkdownV2',
            reply_markup: languageKeyboard
          }
        );
        return;
      }

      console.log('❌ No matching token or referral found');
    } catch (error) {
      console.error('❌ Error handling registration:', error);
    }
  }

  // If no valid registration token or referral, start normal registration flow
  console.log('👤 Starting normal registration flow');
  stateManager.set(chatId, {
    chatId,
    step: 'LANGUAGE_SELECTION'
  });

  // Send language selection
  await bot.sendMessage(
    chatId,
    'Tilni tanlang / Выберите язык:',
    {
      parse_mode: 'MarkdownV2',
      reply_markup: languageKeyboard
    }
  );
};