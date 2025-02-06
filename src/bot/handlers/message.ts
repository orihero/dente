import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { stateManager } from '../services/state.js';
import { translations } from '../i18n/translations.js';
import { handleMenu } from './menu/index.js';
import { escape_markdown_v2 } from '../utils/formatters.js';
import { getMainMenuKeyboard } from './menu/index.js';

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
              language: userState.language?.code,
              referred_by: userState.referredBy
            })
            .select(`
              *,
              dentist:dentists!inner(
                id,
                full_name,
                telegram_bot_chat_id,
                telegram_bot_registered,
                telegram_bot_settings
              ),
              referrer:patients!patients_referred_by_fkey(
                id,
                full_name,
                telegram_chat_id,
                language
              )
            `)
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
            { 
              reply_markup: {
                keyboard: getMainMenuKeyboard(userState.language?.code || 'uz').keyboard,
                resize_keyboard: true
              }
            }
          );

          // Send notification to dentist if they have Telegram bot configured
          if (newPatient.dentist.telegram_bot_registered && newPatient.dentist.telegram_bot_chat_id) {
            const escapedPatientName = escape_markdown_v2(newPatient.full_name);
            const escapedPhone = escape_markdown_v2(newPatient.phone);
            const escapedReferrerName = newPatient.referrer ? escape_markdown_v2(newPatient.referrer.full_name) : null;

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
                    ? `Yangi bemor: ${newPatient.full_name}${newPatient.referrer ? ` (${newPatient.referrer.full_name} tomonidan yo'llangan)` : ''}`
                    : `Новый пациент: ${newPatient.full_name}${newPatient.referrer ? ` (направлен пациентом ${newPatient.referrer.full_name})` : ''}`
                }
              ]);
          }

          // If this was a referral and referral program is enabled, send notifications
          if (newPatient.referrer && newPatient.dentist.telegram_bot_settings?.referral?.enabled) {
            const settings = newPatient.dentist.telegram_bot_settings.referral;
            const discount = settings.percentage;
            const daysActive = settings.days_active;

            // Send notification to referrer
            if (newPatient.referrer.telegram_chat_id) {
              const message = newPatient.referrer.language === 'uz'
                ? `🎉 *Tabriklaymiz\\!*\n\n` +
                  `Siz yo'llagan bemor *${escape_markdown_v2(newPatient.full_name)}* muvaffaqiyatli ro'yxatdan o'tdi\\.\n` +
                  `Keyingi tashrifingizda *${discount}%* chegirmaga ega bo'lasiz\\.\n` +
                  `Chegirma *${daysActive} kun* davomida amal qiladi\\.`
                : `🎉 *Поздравляем\\!*\n\n` +
                  `Приглашённый вами пациент *${escape_markdown_v2(newPatient.full_name)}* успешно зарегистрировался\\.\n` +
                  `При следующем визите вы получите скидку *${discount}%*\\.\n` +
                  `Скидка действует в течение *${daysActive} дней*\\.`;

              await bot.sendMessage(
                newPatient.referrer.telegram_chat_id,
                message,
                { parse_mode: 'MarkdownV2' }
              );
            }
          }
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