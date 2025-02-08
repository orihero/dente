import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations, welcomeTranslations } from '../i18n/translations.js';
import { handleMenu } from './menu/index.js';
import { escape_markdown_v2 } from '../utils/formatters.js';
import { getMainMenuKeyboard } from './menu/index.js';
import { getNewUserMenuKeyboard } from '../keyboards.js';

export const handleMessage = async (bot: any, msg: Message) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text;
  const userState = stateManager.get(chatId);

  // If user is in registration flow, handle registration steps
  if (userState?.step && userState.step !== 'REGISTERED') {
    switch (userState.step) {
      case 'BIRTHDATE_REQUEST':
        // Validate birthdate format (DD.MM.YYYY)
        const birthdateMatch = msg.text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
        if (!birthdateMatch) {
          await bot.sendMessage(
            chatId,
            userState.language?.code === 'uz'
              ? 'Noto\'g\'ri sana formati. Iltimos, DD.MM.YYYY formatida kiriting.\n\nMasalan: 15.03.1990'
              : 'Неверный формат даты. Пожалуйста, введите в формате DD.MM.YYYY.\n\nНапример: 15.03.1990'
          );
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
        await bot.sendMessage(
          chatId,
          userState.language?.code === 'uz'
            ? 'Iltimos, manzilingizni kiriting'
            : 'Пожалуйста, введите ваш адрес'
        );
        break;

      case 'ADDRESS_REQUEST':
        try {
          // Create patient without dentist
          const { data: patient, error: patientError } = await supabase
            .from('patients')
            .insert({
              full_name: userState.registrationData!.full_name,
              phone: userState.registrationData!.phone.replace(/\D/g, ''), // Remove all non-digits
              birthdate: userState.registrationData!.birthdate,
              address: msg.text,
              telegram_chat_id: chatId.toString(),
              telegram_registered: true,
              language: userState.language?.code
            })
            .select()
            .single();

          if (patientError) throw patientError;

          // Update user state
          stateManager.update(chatId, {
            step: 'REGISTERED'
          });

          // Send success message to patient
          await bot.sendMessage(
            chatId,
            welcomeTranslations[userState.language?.code || 'uz'].newUserWelcome(userState.registrationData!.full_name),
            { 
              parse_mode: 'MarkdownV2',
              reply_markup: {
                keyboard: getNewUserMenuKeyboard(userState.language?.code || 'uz').keyboard,
                resize_keyboard: true
              }
            }
          );

        } catch (error: any) {
          console.error('Error creating patient:', error);
          await bot.sendMessage(
            chatId,
            userState.language?.code === 'uz'
              ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
              : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
          );
        }
        break;
    }
    return;
  }

  // For registered users, handle menu options
  try {
    // Get patient data to determine language
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (error) throw error;
    if (!patient) return;

    // Handle menu options
    await handleMenu(bot, msg);
  } catch (error) {
    console.error('Error handling message:', error);
  }
};