import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { handleMenu } from './menu.js';
import { escape_markdown_v2 } from '../utils/formatters.js';

export const handleMessage = async (bot: any, msg: Message) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
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
          // Get referrer info if this is a referral registration
          let referrerInfo = null;
          if (userState.dentistId) {
            const { data: referrer } = await supabase
              .from('patients')
              .select('full_name')
              .eq('id', userState.dentistId)
              .single();
            
            if (referrer) {
              referrerInfo = referrer;
            }
          }

          // Create new patient
          const { data: newPatient, error: createError } = await supabase
            .from('patients')
            .insert({
              dentist_id: userState.dentistId,
              full_name: userState.registrationData!.full_name,
              phone: userState.registrationData!.phone,
              birthdate: userState.registrationData!.birthdate,
              address: msg.text,
              telegram_chat_id: chatId.toString(),
              telegram_registered: true,
              language: userState.language?.code
            })
            .select('*, dentist:dentists(full_name, telegram_bot_chat_id, telegram_bot_registered)')
            .single();

          if (createError) throw createError;

          // Update user state
          stateManager.update(chatId, {
            step: 'REGISTERED'
          });

          // Send success message to patient
          await bot.sendMessage(
            chatId,
            userState.language?.code === 'uz'
              ? `✅ Tabriklaymiz! Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n\nSizning shifokoringiz: ${newPatient.dentist.full_name}`
              : `✅ Поздравляем! Вы успешно зарегистрировались.\n\nВаш врач: ${newPatient.dentist.full_name}`,
            { parse_mode: 'MarkdownV2' }
          );

          // Send notification to dentist if they have Telegram bot configured
          if (newPatient.dentist.telegram_bot_registered && newPatient.dentist.telegram_bot_chat_id) {
            const escapedPatientName = escape_markdown_v2(newPatient.full_name);
            const escapedPhone = escape_markdown_v2(newPatient.phone);
            const escapedReferrerName = referrerInfo ? escape_markdown_v2(referrerInfo.full_name) : null;

            // Send in Uzbek
            await bot.sendMessage(
              newPatient.dentist.telegram_bot_chat_id,
              `👥 *Yangi bemor*\n\n` +
              `Ism: *${escapedPatientName}*\n` +
              `Telefon: *${escapedPhone}*\n` +
              (escapedReferrerName 
                ? `Yo'llagan bemor: *${escapedReferrerName}*`
                : `Yo'llanma orqali ro'yxatdan o'tdi`),
              { parse_mode: 'MarkdownV2' }
            );

            // Send in Russian
            await bot.sendMessage(
              newPatient.dentist.telegram_bot_chat_id,
              `👥 *Новый пациент*\n\n` +
              `Имя: *${escapedPatientName}*\n` +
              `Телефон: *${escapedPhone}*\n` +
              (escapedReferrerName
                ? `Направивший пациент: *${escapedReferrerName}*`
                : `Зарегистрировался по реферальной ссылке`),
              { parse_mode: 'MarkdownV2' }
            );
          } else {
            // Create notification for dentist to see in web interface
            await supabase
              .from('notifications')
              .insert([
                {
                  type: 'system',
                  recipient: newPatient.dentist_id,
                  message: userState.language?.code === 'uz'
                    ? `Yangi bemor: ${newPatient.full_name}${referrerInfo ? ` (${referrerInfo.full_name} tomonidan yo'llangan)` : ''}`
                    : `Новый пациент: ${newPatient.full_name}${referrerInfo ? ` (направлен пациентом ${referrerInfo.full_name})` : ''}`
                }
              ]);
          }

          // Send main menu
          await bot.sendMessage(
            chatId,
            userState.language?.code === 'uz'
              ? '🏥 Asosiy menyu'
              : '🏥 Главное меню',
            { 
              parse_mode: 'MarkdownV2',
              reply_markup: {
                keyboard: [
                  [
                    { text: userState.language?.code === 'uz' ? '👨‍⚕️ Mening shifokorim' : '👨‍⚕️ Мой врач' },
                    { text: userState.language?.code === 'uz' ? '📝 Mening yozuvlarim' : '📝 Мои записи' }
                  ],
                  [
                    { text: userState.language?.code === 'uz' ? '📅 Mening qabullarim' : '📅 Мои приёмы' },
                    { text: userState.language?.code === 'uz' ? '👨‍👩‍👧‍👦 Mening oilam' : '👨‍👩‍👧‍👦 Моя семья' }
                  ],
                  [
                    { text: userState.language?.code === 'uz' ? '🎁 Mening bonuslarim' : '🎁 Мои бонусы' },
                    { text: userState.language?.code === 'uz' ? '⚙️ Sozlamalar' : '⚙️ Настройки' }
                  ]
                ],
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