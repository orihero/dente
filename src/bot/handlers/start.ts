import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { languageKeyboard } from '../keyboards.js';

export const handleStart = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  
  // Check if this is a registration link
  const text = msg.text || '';
  const match = text.match(/\/start\s+(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/);
  
  if (match) {
    const registrationToken = match[1];
    console.log('Registration token:', registrationToken);
    
    try {
      // First try to find dentist with this token
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select('*')
        .eq('telegram_registration_token', registrationToken)
        .maybeSingle();

      if (dentistError) {
        console.error('Error fetching dentist:', dentistError);
        throw dentistError;
      }

      // If dentist found
      if (dentist) {
        console.log('Found dentist:', dentist);
        
        // Update dentist with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('dentists')
          .update({
            telegram_bot_chat_id: chatId.toString(),
            telegram_bot_registered: true,
            telegram_registration_token: null, // Clear token after use
            telegram_bot_settings: {
              enabled: true,
              loyalty: {
                birthday: {
                  enabled: false,
                  days_before: 0,
                  days_after: 0,
                  percentage: 0
                }
              },
              referral: {
                enabled: false,
                percentage: 0,
                days_active: 0
              }
            }
          })
          .eq('id', dentist.id);

        if (updateError) {
          console.error('Error updating dentist:', updateError);
          throw updateError;
        }

        // Send welcome message
        await bot.sendMessage(
          chatId,
          `Xush kelibsiz, ${dentist.full_name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`
        );
        return;
      }

      // If not a dentist token, check if it's a patient token
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('telegram_registration_token', registrationToken)
        .maybeSingle();

      if (patientError) {
        console.error('Error fetching patient:', patientError);
        throw patientError;
      }

      // If patient found
      if (patient) {
        console.log('Found patient:', patient);

        // Update patient with telegram chat ID and mark as registered
        const { error: updateError } = await supabase
          .from('patients')
          .update({
            telegram_chat_id: chatId.toString(),
            telegram_registered: true,
            telegram_registration_token: null // Clear token after use
          })
          .eq('id', patient.id);

        if (updateError) throw updateError;

        // Send welcome message
        await bot.sendMessage(
          chatId,
          `Xush kelibsiz, ${patient.full_name}! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.`
        );
        return;
      }

      // If no dentist or patient found
      console.log('No dentist or patient found with token:', registrationToken);
      await bot.sendMessage(
        chatId,
        'Kechirasiz, ro\'yxatdan o\'tish havolasi yaroqsiz yoki eskirgan.'
      );
      return;
    } catch (error) {
      console.error('Error handling registration:', error);
      await bot.sendMessage(
        chatId,
        'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
      );
      return;
    }
  }

  // Initialize user state
  stateManager.set(chatId, {
    chatId,
    step: 'LANGUAGE_SELECTION'
  });

  // Send welcome message with language selection
  bot.sendMessage(chatId, 'Tilni tanlang / Выберите язык:', {
    parse_mode: 'MarkdownV2',
    reply_markup: languageKeyboard
  });
};