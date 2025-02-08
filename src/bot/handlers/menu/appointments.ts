import { CallbackQuery } from 'node-telegram-bot-api';
import { supabase } from '../../services/supabase.js';
import { translations } from '../../i18n/translations.js';
import { formatDateTime, escape_markdown_v2 } from '../../utils/formatters.js';
import { Appointment, WorkingHours } from '../../types.js';

export const handleTimeSelection = async (bot: any, query: CallbackQuery, language: 'uz' | 'ru') => {
  if (!query.message || !query.data) return;

  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const [_, appointmentId, time] = query.data.split('_');

  try {
    // Get appointment details
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

    // Get current appointment date
    const currentDate = new Date(appointment.appointment_time);
    
    // Create new date with selected time
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);

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
};


export const handleAppointmentAction = async (bot: any, query: CallbackQuery, language: 'uz' | 'ru') => {
  if (!query.message || !query.data) return;

  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const [action, appointmentId] = query.data.split('_');

  try {
    // Get appointment details
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

    switch (action) {
      case 'confirm':
        // Update appointment status
        await supabase
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', appointmentId);

        // Send confirmation to patient
        await bot.editMessageText(
          language === 'uz'
            ? '✅ Qabul muvaffaqiyatli tasdiqlandi'
            : '✅ Приём успешно подтверждён',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

        // Send notification to dentist if they have Telegram bot configured
        if (appointment.dentist.telegram_bot_registered && appointment.dentist.telegram_bot_chat_id) {
          const escapedPatientName = escape_markdown_v2(appointment.patient.full_name);
          
          // Get appointment time in local timezone
          const appointmentDate = new Date(appointment.appointment_time);
          
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

          // Format date/time
          const formattedDate = appointmentDate.toLocaleDateString('ru-RU', dateFormatOptions);
          const formattedTime = appointmentDate.toLocaleTimeString('ru-RU', timeFormatOptions);

          // Escape formatted dates for Markdown V2
          const escapedDate = escape_markdown_v2(formattedDate);
          const escapedTime = escape_markdown_v2(formattedTime);

          // Send in Uzbek
          await bot.sendMessage(
            appointment.dentist.telegram_bot_chat_id,
            `✅ *Qabul tasdiqlandi*\n\n` +
            `Bemor: *${escapedPatientName}*\n` +
            `Sana: *${escapedDate}*\n` +
            `Vaqt: *${escapedTime}*`,
            { parse_mode: 'MarkdownV2' }
          );

          // Send in Russian
          await bot.sendMessage(
            appointment.dentist.telegram_bot_chat_id,
            `✅ *Приём подтверждён*\n\n` +
            `Пациент: *${escapedPatientName}*\n` +
            `Дата: *${escapedDate}*\n` +
            `Время: *${escapedTime}*`,
            { parse_mode: 'MarkdownV2' }
          );
        }
        break;

      case 'cancel':
        // Update appointment status
        await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointmentId);

        // Send cancellation message to patient
        await bot.editMessageText(
          language === 'uz'
            ? '❌ Qabul bekor qilindi'
            : '❌ Приём отменён',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

        // Send notification to dentist if they have Telegram bot configured
        if (appointment.dentist.telegram_bot_registered && appointment.dentist.telegram_bot_chat_id) {
          const escapedPatientName = escape_markdown_v2(appointment.patient.full_name);
          
          // Get appointment time in local timezone
          const appointmentDate = new Date(appointment.appointment_time);
          
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

          // Format date/time
          const formattedDate = appointmentDate.toLocaleDateString('ru-RU', dateFormatOptions);
          const formattedTime = appointmentDate.toLocaleTimeString('ru-RU', timeFormatOptions);

          // Escape formatted dates for Markdown V2
          const escapedDate = escape_markdown_v2(formattedDate);
          const escapedTime = escape_markdown_v2(formattedTime);

          // Send in Uzbek
          await bot.sendMessage(
            appointment.dentist.telegram_bot_chat_id,
            `❌ *Qabul bekor qilindi*\n\n` +
            `Bemor: *${escapedPatientName}*\n` +
            `Sana: *${escapedDate}*\n` +
            `Vaqt: *${escapedTime}*`,
            { parse_mode: 'MarkdownV2' }
          );

          // Send in Russian
          await bot.sendMessage(
            appointment.dentist.telegram_bot_chat_id,
            `❌ *Приём отменён*\n\n` +
            `Пациент: *${escapedPatientName}*\n` +
            `Дата: *${escapedDate}*\n` +
            `Время: *${escapedTime}*`,
            { parse_mode: 'MarkdownV2' }
          );
        }
        break;

      case 'reschedule':
        // Show time selection options
        const workingHours = appointment.dentist.clinic?.working_hours || {
          monday: { open: '09:00', close: '18:00' },
          tuesday: { open: '09:00', close: '18:00' },
          wednesday: { open: '09:00', close: '18:00' },
          thursday: { open: '09:00', close: '18:00' },
          friday: { open: '09:00', close: '18:00' },
          saturday: { open: '09:00', close: '14:00' },
          sunday: null
        };

        // Generate available time slots
        const timeSlots = generateTimeSlots(workingHours);

        // Create inline keyboard with time slots
        const keyboard = {
          inline_keyboard: timeSlots.map(slot => [{
            text: slot,
            callback_data: `time_${appointmentId}_${slot}`
          }])
        };

        // Send time selection message
        await bot.editMessageText(
          language === 'uz'
            ? '🕒 Yangi vaqtni tanlang:'
            : '🕒 Выберите новое время:',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: keyboard
          }
        );
        break;
    }
  } catch (error) {
    console.error('Error handling appointment action:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};

// Helper function to generate time slots based on working hours
function generateTimeSlots(workingHours: WorkingHours): string[] {
  const slots: string[] = [];
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = workingHours[today as keyof WorkingHours];

  if (hours) {
    const [openHour] = hours.open.split(':').map(Number);
    const [closeHour] = hours.close.split(':').map(Number);

    for (let hour = openHour; hour < closeHour; hour++) {
      // Add both :00 and :30 slots
      slots.push(
        `${hour.toString().padStart(2, '0')}:00`,
        `${hour.toString().padStart(2, '0')}:30`
      );
    }
  }

  return slots;
}

// Helper function to check if time slot is available
async function isTimeSlotAvailable(dentistId: string, date: Date): Promise<boolean> {
  // Get appointments for this dentist on this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('appointment_time')
    .eq('dentist_id', dentistId)
    .gte('appointment_time', startOfDay.toISOString())
    .lte('appointment_time', endOfDay.toISOString())
    .neq('status', 'cancelled');

  if (!existingAppointments) return true;

  // Check if there's any appointment at this exact time
  return !existingAppointments.some(apt => {
    const aptTime = new Date(apt.appointment_time);
    return aptTime.getTime() === date.getTime();
  });
}