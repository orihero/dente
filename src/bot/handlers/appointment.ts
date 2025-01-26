import { CallbackQuery } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { translations } from '../i18n/translations.js';
import { formatDateTime, escape_markdown_v2 } from '../utils/formatters.js';
import { Appointment, WorkingHours } from '../types.js';

async function handleTimeSelection(bot: any, chatId: number, callbackData: string, messageId: number, language: 'uz' | 'ru') {
  try {
    const [, appointmentId, date, time] = callbackData.split('_');
    
    // Parse the date and time in the local timezone
    const [hours, minutes] = time.split(':');
    const newDate = new Date(date);
    
    // Set hours and minutes in the local timezone
    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Get appointment details for notifications
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(full_name),
        dentist:dentists(
          id,
          full_name,
          telegram_bot_chat_id,
          telegram_bot_registered
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError) throw appointmentError;

    // Update appointment time
    await supabase
      .from('appointments')
      .update({ 
        appointment_time: newDate.toISOString(),
        status: 'confirmed'
      })
      .eq('id', appointmentId);

    // Send confirmation to patient
    await bot.editMessageText(
      language === 'uz'
        ? '✅ Qabul muvaffaqiyatli qayta rejalashtirildi'
        : '✅ Приём успешно перенесён',
      {
        chat_id: chatId,
        message_id: messageId
      }
    );

    // Send notification to dentist if they have Telegram bot configured
    if (appointment.dentist.telegram_bot_registered && appointment.dentist.telegram_bot_chat_id) {
      const escapedPatientName = escape_markdown_v2(appointment.patient.full_name);
      
      // Get old appointment time in local timezone
      const oldDate = new Date(appointment.appointment_time);
      
      // Format dates using explicit formatting options
      const dateFormatOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };

      const timeFormatOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };

      // Format old date/time
      const formattedOldDate = oldDate.toLocaleDateString('ru-RU', dateFormatOptions);
      const formattedOldTime = oldDate.toLocaleTimeString('ru-RU', timeFormatOptions);

      // Format new date/time
      const formattedNewDate = newDate.toLocaleDateString('ru-RU', dateFormatOptions);
      const formattedNewTime = newDate.toLocaleTimeString('ru-RU', timeFormatOptions);

      // Escape formatted dates for Markdown V2
      const escapedOldDate = escape_markdown_v2(formattedOldDate);
      const escapedOldTime = escape_markdown_v2(formattedOldTime);
      const escapedNewDate = escape_markdown_v2(formattedNewDate);
      const escapedNewTime = escape_markdown_v2(formattedNewTime);

      // Send in Uzbek
      await bot.sendMessage(
        appointment.dentist.telegram_bot_chat_id,
        `🔄 *Qabul qayta rejalashtirildi*\n\n` +
        `Bemor: *${escapedPatientName}*\n` +
        `Eski vaqt: *${escapedOldDate}* *${escapedOldTime}*\n` +
        `Yangi vaqt: *${escapedNewDate}* *${escapedNewTime}*`,
        { parse_mode: 'MarkdownV2' }
      );

      // Send in Russian
      await bot.sendMessage(
        appointment.dentist.telegram_bot_chat_id,
        `🔄 *Приём перенесён*\n\n` +
        `Пациент: *${escapedPatientName}*\n` +
        `Старое время: *${escapedOldDate}* *${escapedOldTime}*\n` +
        `Новое время: *${escapedNewDate}* *${escapedNewTime}*`,
        { parse_mode: 'MarkdownV2' }
      );
    }
  } catch (error) {
    console.error('Error handling time selection:', error);
    throw error;
  }
}

// ... (keep all other code unchanged)