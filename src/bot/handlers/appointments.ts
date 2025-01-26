import { supabase } from '../services/supabase.js';
import { translations } from '../i18n/translations.js';
import { formatDateTime, escapeMarkdown } from '../utils/formatters.js';
import { AppointmentData } from "../types.js";

export const handleAppointments = async (bot: any, chatId: number, patient: any) => {
  try {
    // Get upcoming appointments
    const { data: upcomingAppointments, error: upcomingError } = await supabase
      .from("appointments")
      .select(`
        *,
        dentist:dentists(
          full_name
        )
      `)
      .eq("patient_id", patient.id)
      .gte("appointment_time", new Date().toISOString())
      .order("appointment_time");

    if (upcomingError) throw upcomingError;

    // Get past appointments
    const { data: pastAppointments, error: pastError } = await supabase
      .from("appointments")
      .select(`
        *,
        dentist:dentists(
          full_name
        )
      `)
      .eq("patient_id", patient.id)
      .lt("appointment_time", new Date().toISOString())
      .order("appointment_time", { ascending: false })
      .limit(5);

    if (pastError) throw pastError;

    const t = translations[patient.language].appointment;

    // Format message
    let message = `*${t.title}*\n\n`;

    // Add upcoming appointments
    if (upcomingAppointments && upcomingAppointments.length > 0) {
      message += `*${t.upcomingTitle}*\n`;
      upcomingAppointments.forEach((appointment: AppointmentData) => {
        message += formatAppointmentMessage(appointment, patient.language);
      });
      message += "\n";
    }

    // Add past appointments
    if (pastAppointments && pastAppointments.length > 0) {
      message += `*${t.pastTitle}*\n`;
      pastAppointments.forEach((appointment: AppointmentData) => {
        message += formatAppointmentMessage(appointment, patient.language);
      });
    }

    // If no appointments
    if ((!upcomingAppointments || upcomingAppointments.length === 0) && 
        (!pastAppointments || pastAppointments.length === 0)) {
      message += t.noAppointments;
    }

    await bot.sendMessage(chatId, message, { parse_mode: "MarkdownV2" });
  } catch (error) {
    console.error("Error handling appointments:", error);
    await bot.sendMessage(
      chatId,
      translations[patient.language].errors.general,
      { parse_mode: "MarkdownV2" }
    );
  }
};

function formatAppointmentMessage(appointment: AppointmentData, language: "uz" | "ru"): string {
  const t = translations[language].appointment;
  const statusEmoji = getStatusEmoji(appointment.status);
  const statusText = t.statuses[appointment.status as keyof typeof t.statuses];
  const dateTime = escapeMarkdown(formatDateTime(appointment.appointment_time, language));

  let message = `${statusEmoji} *${dateTime}*\n` +
                `👨‍⚕️ ${t.doctor}: *${escapeMarkdown(appointment.dentist.full_name)}*\n` +
                `📝 ${t.status}: *${escapeMarkdown(statusText)}*`;

  if (appointment.notes) {
    message += `\n💭 ${t.note}: _${escapeMarkdown(appointment.notes)}_`;
  }

  return message + "\n\n";
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case "pending":
      return "⏳";
    case "confirmed":
      return "✅";
    case "cancelled":
      return "❌";
    case "completed":
      return "✨";
    default:
      return "📅";
  }
}