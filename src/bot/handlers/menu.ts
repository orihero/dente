import { Message } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { menuTranslations } from '../i18n/translations/menu.js';
import { handleAppointments } from './appointments.js';
import { handleRecords } from './records.js';
import { mainMenuKeyboard, settingsKeyboard, languageKeyboard } from '../keyboards.js';
import { escape_markdown_v2 } from '../utils/formatters.js';

// Export keyboard getter for other modules
export const getMainMenuKeyboard = (language: 'uz' | 'ru') => mainMenuKeyboard[language];

export const handleMenu = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  try {
    // First get patient data to determine language
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*, dentist_id, language')
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (patientError) throw patientError;
    if (!patient) {
      console.error('No patient found for chat ID:', chatId);
      return;
    }

    const t = menuTranslations[patient.language || 'uz'];

    // Handle menu options
    switch (text) {
      case t.mainMenu.myDoctor: {
        try {
          // Get dentist data with services in a single query
          const { data: dentist, error: dentistError } = await supabase
            .from('dentists')
            .select(`
              id,
              full_name,
              phone,
              experience,
              photo_url,
              social_media,
              dentist_services (
                id,
                price,
                duration,
                warranty,
                base_service:base_services (
                  id,
                  name_uz,
                  name_ru,
                  category:service_categories (
                    id,
                    name_uz,
                    name_ru,
                    color
                  )
                )
              )
            `)
            .eq('id', patient.dentist_id)
            .single();

          if (dentistError) throw dentistError;

          // Format dentist info message
          let message = `*${escape_markdown_v2(t.doctor.title)}*\n\n`;

          // Basic info
          message += `*${escape_markdown_v2(t.doctor.name)}:* ${escape_markdown_v2(dentist.full_name)}\n` +
                    `*${escape_markdown_v2(t.doctor.phone)}:* ${escape_markdown_v2(dentist.phone)}\n` +
                    `*${escape_markdown_v2(t.doctor.experience)}:* ${dentist.experience} ${escape_markdown_v2(t.doctor.years)}\n\n`;

          // Add referral link
          message += `*${escape_markdown_v2(t.doctor.referralLink)}:*\n` +
                    `https://t\\.me/denteuzbot\\?start\\=${patient.id}\n\n`;

          // Social media links
          if (dentist.social_media?.platforms?.length > 0) {
            message += `*${escape_markdown_v2(t.doctor.socialMedia)}:*\n`;
            dentist.social_media.platforms.forEach((platform: any) => {
              message += `[${escape_markdown_v2(platform.platform)}](${platform.url})\n`;
            });
            message += '\n';
          }

          // Group services by category
          const servicesByCategory = dentist.dentist_services.reduce((acc: any, service: any) => {
            const categoryId = service.base_service.category.id;
            if (!acc[categoryId]) {
              acc[categoryId] = {
                category: service.base_service.category,
                services: []
              };
            }
            acc[categoryId].services.push(service);
            return acc;
          }, {});

          // Add services section
          if (dentist.dentist_services.length > 0) {
            message += `*${escape_markdown_v2(t.doctor.services)}:*\n\n`;

            Object.values(servicesByCategory).forEach((group: any) => {
              message += `*${escape_markdown_v2(patient.language === 'uz' ? group.category.name_uz : group.category.name_ru)}*\n`;
              
              group.services.forEach((service: any) => {
                const name = patient.language === 'uz' 
                  ? service.base_service.name_uz 
                  : service.base_service.name_ru;
                
                message += `• ${escape_markdown_v2(name)}\n` +
                          `  💰 ${escape_markdown_v2(service.price.toLocaleString())} UZS\n` +
                          `  ⏱ ${escape_markdown_v2(service.duration)}\n` +
                          `  🛡 ${escape_markdown_v2(service.warranty)}\n\n`;
              });
            });
          } else {
            message += escape_markdown_v2(
              patient.language === 'uz'
                ? 'Shifokor hali xizmatlarni qo\'shmagan'
                : 'Врач ещё не добавил услуги'
            );
          }

          // Send photo if available
          if (dentist.photo_url) {
            await bot.sendPhoto(chatId, dentist.photo_url, {
              caption: message,
              parse_mode: 'MarkdownV2'
            });
          } else {
            await bot.sendMessage(chatId, message, { 
              parse_mode: 'MarkdownV2',
              disable_web_page_preview: true
            });
          }
        } catch (error) {
          console.error('Error fetching dentist data:', error);
          throw error;
        }
        break;
      }

      case t.mainMenu.myRecords:
        await handleRecords(bot, chatId, patient);
        break;

      case t.mainMenu.myAppointments:
        await handleAppointments(bot, chatId, patient);
        break;

      case t.mainMenu.myFamily:
        await bot.sendMessage(
          chatId, 
          escape_markdown_v2(t.comingSoon.family),
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case t.mainMenu.myBonuses:
        await bot.sendMessage(
          chatId,
          escape_markdown_v2(t.comingSoon.bonuses),
          { parse_mode: 'MarkdownV2' }
        );
        break;

      case t.mainMenu.settings:
        await bot.sendMessage(
          chatId,
          escape_markdown_v2(patient.language === 'uz' ? 'Sozlamalarni tanlang:' : 'Выберите настройки:'),
          { 
            parse_mode: 'MarkdownV2',
            reply_markup: settingsKeyboard[patient.language || 'uz'] 
          }
        );
        break;

      case t.settings.back:
        await bot.sendMessage(
          chatId,
          escape_markdown_v2(patient.language === 'uz' ? 'Asosiy menyu:' : 'Главное меню:'),
          { 
            parse_mode: 'MarkdownV2',
            reply_markup: mainMenuKeyboard[patient.language || 'uz'] 
          }
        );
        break;

      case t.settings.changeLanguage:
        await bot.sendMessage(
          chatId,
          escape_markdown_v2('Tilni tanlang / Выберите язык:'),
          {
            parse_mode: 'MarkdownV2',
            reply_markup: languageKeyboard
          }
        );
        break;

      case t.settings.referralProgram: {
        try {
          // Format message with bot referral link
          const message = patient.language === 'uz'
            ? `🔗 *Referal dasturi*\n\n` +
              `Sizning referal havolangiz:\n` +
              `https://t\\.me/denteuzbot\\?start\\=${patient.id}\n\n` +
              `Bu havola orqali ro'yxatdan o'tgan har bir bemor uchun bonus olasiz\\!`
            : `🔗 *Реферальная программа*\n\n` +
              `Ваша реферальная ссылка:\n` +
              `https://t\\.me/denteuzbot\\?start\\=${patient.id}\n\n` +
              `Вы получите бонус за каждого пациента, зарегистрировавшегося по этой ссылке\\!`;

          await bot.sendMessage(chatId, message, {
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true
          });
        } catch (error) {
          console.error('Error handling referral program:', error);
          await bot.sendMessage(
            chatId,
            escape_markdown_v2(t.comingSoon.referral),
            { parse_mode: 'MarkdownV2' }
          );
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error handling menu:', error);
    await bot.sendMessage(
      chatId,
      escape_markdown_v2(
        msg.from?.language_code === 'uz'
          ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
          : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
      ),
      { parse_mode: 'MarkdownV2' }
    );
  }
};