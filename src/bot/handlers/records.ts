import { supabase } from '../services/supabase.js';
import { menuTranslations } from '../i18n/translations/menu.js';
import { escape_markdown_v2 } from '../utils/formatters.js';
import { sendSMS } from '../services/sms.js';

export const handleRecords = async (bot: any, chatId: number, patient: any) => {
  try {
    // Get patient's records with services
    const { data: records, error } = await supabase
      .from('patient_records')
      .select(`
        *,
        services:record_services(
          id,
          price,
          service:dentist_services(
            base_service:base_services(
              name_uz,
              name_ru
            ),
            duration,
            warranty
          )
        )
      `)
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const t = menuTranslations[patient.language];

    if (!records || records.length === 0) {
      await bot.sendMessage(
        chatId,
        patient.language === 'uz'
          ? 'Sizda hozircha yozuvlar yo\'q'
          : 'У вас пока нет записей'
      );
      return;
    }

    // Send each record as a separate message
    for (const record of records) {
      let message = `📝 *${escape_markdown_v2(
        patient.language === 'uz' ? 'Tibbiy yozuv' : 'Медицинская запись'
      )}*\n\n`;

      // Add date
      message += `📅 *${escape_markdown_v2(
        new Date(record.created_at).toLocaleDateString(
          patient.language === 'uz' ? 'uz-UZ' : 'ru-RU'
        )
      )}*\n\n`;

      // Add diagnosis
      message += `*${escape_markdown_v2(
        patient.language === 'uz' ? 'Tashxis' : 'Диагноз'
      )}:*\n${escape_markdown_v2(record.diagnosis)}\n\n`;

      // Add services
      if (record.services && record.services.length > 0) {
        message += `*${escape_markdown_v2(
          patient.language === 'uz' ? 'Xizmatlar' : 'Услуги'
        )}:*\n`;

        record.services.forEach((service: any) => {
          const name = patient.language === 'uz'
            ? service.service.base_service.name_uz
            : service.service.base_service.name_ru;

          message += `• ${escape_markdown_v2(name)}\n` +
                    `  💰 ${escape_markdown_v2(service.price.toLocaleString())} UZS\n` +
                    `  ⏱ ${escape_markdown_v2(service.service.duration)}\n` +
                    `  🛡 ${escape_markdown_v2(service.service.warranty)}\n\n`;
        });
      }

      // Add recipe if exists
      if (record.recipe) {
        message += `*${escape_markdown_v2(
          patient.language === 'uz' ? 'Dori-darmonlar' : 'Лекарства'
        )}:*\n${escape_markdown_v2(record.recipe)}\n\n`;
      }

      // Add suggestions if exists
      if (record.suggestions) {
        message += `*${escape_markdown_v2(
          patient.language === 'uz' ? 'Tavsiyalar' : 'Рекомендации'
        )}:*\n${escape_markdown_v2(record.suggestions)}`;
      }

      await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    }
  } catch (error) {
    console.error('Error handling records:', error);
    await bot.sendMessage(
      chatId,
      patient.language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};

// Function to send record notification
export const sendRecordNotification = async (record: any, patient: any, dentist: any) => {
  try {
    // Generate registration token for Telegram bot
    const { data: token, error: tokenError } = await supabase
      .rpc('generate_telegram_registration_token', {
        patient_id: patient.id
      });

    if (tokenError) throw tokenError;

    const botLink = `https://t.me/denteuzbot?start=${token}`;

    // Create messages based on patient's language
    const messages = {
      uz: {
        telegram: `🦷 *Yangi tibbiy yozuv*\n\n` +
                 `Hurmatli *${escape_markdown_v2(patient.full_name)}*,\n` +
                 `*${escape_markdown_v2(dentist.full_name)}* shifokor tomonidan yangi tibbiy yozuv yaratildi\\.\n\n` +
                 `*Tashxis:*\n${escape_markdown_v2(record.diagnosis)}`,
        sms: `Hurmatli ${patient.full_name}, ${dentist.full_name} shifokor tomonidan yangi tibbiy yozuv yaratildi. ` +
             `Retsept va tavsiyalarni ko'rish uchun Telegram botimizga ulaning: ${botLink}`
      },
      ru: {
        telegram: `🦷 *Новая медицинская запись*\n\n` +
                 `Уважаемый\\(ая\\) *${escape_markdown_v2(patient.full_name)}*,\n` +
                 `Врач *${escape_markdown_v2(dentist.full_name)}* создал\\(а\\) новую медицинскую запись\\.\n\n` +
                 `*Диагноз:*\n${escape_markdown_v2(record.diagnosis)}`,
        sms: `Уважаемый(ая) ${patient.full_name}, врач ${dentist.full_name} создал(а) новую медицинскую запись. ` +
             `Подключитесь к нашему Telegram боту, чтобы увидеть рецепт и рекомендации: ${botLink}`
      }
    };

    // Send notification based on patient's preferred method
    if (patient.telegram_registered && patient.telegram_chat_id) {
      // Send via Telegram
      await supabase
        .from('notifications')
        .insert({
          type: 'telegram',
          status: 'pending',
          recipient: patient.telegram_chat_id,
          message: messages[patient.language || 'uz'].telegram
        });
    } else {
      // Send via SMS
      await sendSMS({
        phone: patient.phone,
        text: messages[patient.language || 'uz'].sms
      });
    }
  } catch (error) {
    console.error('Error sending record notification:', error);
  }
};