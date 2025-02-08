import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { languageKeyboard } from '../keyboards.js';
import { translations, welcomeTranslations } from '../i18n/translations.js';
import { getMainMenuKeyboard } from './menu/index.js';
import axios from 'axios';

export const handleStart = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  console.log('🚀 Start handler called for chat ID:', chatId);
  
  // Function to get and store user's avatar
  const getUserAvatar = async (userId: number) => {
    try {
      // Get user profile photos
      const photos = await bot.getUserProfilePhotos(userId, 0, 1);
      if (photos.total_count > 0) {
        // Get file path of the first photo
        const file = await bot.getFile(photos.photos[0][0].file_id);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        
        // Download photo
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        
        // Upload to Supabase storage
        const fileName = `${userId}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('patient-avatars')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('patient-avatars')
          .getPublicUrl(fileName);

        return publicUrl;
      }
    } catch (error) {
      console.error('Error getting user avatar:', error);
    }
    return null;
  };

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
    const welcomeMessage = welcomeTranslations[existingPatient.language || 'uz'].patientWelcome(existingPatient.full_name);
    await bot.sendMessage(
      chatId,
      welcomeMessage,
      { 
        parse_mode: 'MarkdownV2',
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
        // Get dentist's language preference
        const dentistLanguage = dentist.language || 'uz';

        // Initialize state with registration token
        stateManager.set(chatId, {
          chatId,
          step: 'CONTACT_REQUEST',
          registrationToken: referralId,
          language: {
            code: dentistLanguage,
            label: dentistLanguage === 'uz' ? 'O\'zbekcha' : 'Русский',
            flag: dentistLanguage === 'uz' ? '🇺🇿' : '🇷🇺'
          }
        });

        // Send welcome message in dentist's language
        const welcomeMessage = welcomeTranslations[dentistLanguage].newUserWelcome(dentist.full_name);
        await bot.sendMessage(
          chatId,
          welcomeMessage,
          {
            parse_mode: 'MarkdownV2'
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
        // Get dentist's language preference
        const { data: dentist, error: dentistError } = await supabase
          .from('dentists')
          .select('*')
          .eq('id', patient.dentist_id)
          .single();

        if (dentistError) throw dentistError;
        
        const dentistLanguage = dentist?.language || 'uz';

        // Update patient with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('patients')
          .update(Object.assign({
            telegram_chat_id: chatId.toString(),
            telegram_registered: true,
            telegram_registration_token: null,
            language: dentistLanguage
          }, msg.from?.id ? { avatar_url: await getUserAvatar(msg.from.id) } : {}))
          .eq('id', patient.id);

        if (updateError) throw updateError;

        // Send welcome message in dentist's language
        const welcomeMessage = welcomeTranslations[dentistLanguage].patientWelcome(patient.full_name);
        await bot.sendMessage(
          chatId,
          welcomeMessage,
          {
            parse_mode: 'MarkdownV2',
            reply_markup: getMainMenuKeyboard(dentistLanguage)
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