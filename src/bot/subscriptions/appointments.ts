import { supabase } from '../services/supabase.js';
import { defaultTemplates } from './templates/defaultTemplates.js';
import { escape_markdown_v2 } from '../utils/formatters.js';
import { sendSMS } from '../services/sms.js';

interface AppointmentPayload {
  id: string;
  patient_id: string;
  dentist_id: string;
  appointment_time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export const setupAppointmentsSubscription = (bot: any) => {
  console.log('Setting up Realtime subscription for appointments...');

  const appointmentsChannel = supabase.channel('appointments-channel')
    .on(
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'appointments'
      },
      async (payload: { new: AppointmentPayload; old?: AppointmentPayload }) => {
        console.log('Received appointment change:', payload);
        
        const appointment = payload.new;
        const isUpdate = payload.old && payload.old.appointment_time !== appointment.appointment_time;
        
        try {
          // Get patient details
          const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', appointment.patient_id)
            .single();

          if (patientError) throw patientError;

          // Get dentist details
          const { data: dentist, error: dentistError } = await supabase
            .from('dentists')
            .select('*, message_templates')
            .eq('id', appointment.dentist_id)
            .single();

          if (dentistError) throw dentistError;

          // Prepare variables with escaped values
          const variables = {
            patientName: escape_markdown_v2(patient.full_name),
            dentistName: escape_markdown_v2(dentist.full_name),
            date: escape_markdown_v2(new Date(appointment.appointment_time).toLocaleDateString('ru-RU')),
            time: escape_markdown_v2(new Date(appointment.appointment_time).toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }))
          };

          // Add old time variables if this is an update
          if (isUpdate && payload.old) {
            const oldTime = new Date(payload.old.appointment_time);
            Object.assign(variables, {
              oldDate: escape_markdown_v2(oldTime.toLocaleDateString('ru-RU')),
              oldTime: escape_markdown_v2(oldTime.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }))
            });
          }

          // Send notification based on patient's preferred method
          if (patient.telegram_registered && patient.telegram_chat_id) {
            // Send via Telegram
            const template = dentist.message_templates?.appointment?.telegram || {
              uz: defaultTemplates.appointments.newAppointment.uz(variables).telegram,
              ru: defaultTemplates.appointments.newAppointment.ru(variables).telegram
            };

            try {
              // Create inline keyboard for appointment actions
              const inlineKeyboard = {
                reply_markup: {
                  inline_keyboard: [
                    [
                      { 
                        text: '✅ Tasdiqlash',
                        callback_data: `confirm_${appointment.id}` 
                      },
                      { 
                        text: '❌ Bekor qilish',
                        callback_data: `cancel_${appointment.id}` 
                      },
                      { 
                        text: '🔄 Qayta rejalashtirish',
                        callback_data: `reschedule_${appointment.id}` 
                      }
                    ]
                  ]
                }
              };

              // Send in both languages with appointment buttons
              await bot.sendMessage(
                patient.telegram_chat_id, 
                template.uz,
                { 
                  parse_mode: 'MarkdownV2',
                  ...inlineKeyboard
                }
              );

              await bot.sendMessage(
                patient.telegram_chat_id, 
                template.ru,
                { 
                  parse_mode: 'MarkdownV2',
                  ...inlineKeyboard
                }
              );

              console.log('Successfully sent appointment notification via Telegram');
            } catch (error) {
              console.error('Error sending Telegram notification:', error);
              // Fallback to SMS
              await sendSMSNotification(patient, dentist, variables);
            }
          } else {
            // Send via SMS
            await sendSMSNotification(patient, dentist, variables);
          }
        } catch (error) {
          console.error('Error handling appointment notification:', error);
        }
      }
    )
    .subscribe();

  return appointmentsChannel;
};

// Helper function to send SMS notification
async function sendSMSNotification(patient: any, dentist: any, variables: any) {
  try {
    // Generate registration token for Telegram bot
    const { data: token, error: tokenError } = await supabase
      .rpc('generate_telegram_registration_token', {
        patient_id: patient.id
      });

    if (tokenError) throw tokenError;

    // Get SMS template
    const template = dentist.message_templates?.appointment?.sms || {
      uz: defaultTemplates.appointments.newAppointment.uz({
        ...variables,
        botLink: `https://t.me/denteuzbot?start=${token}`
      }).sms,
      ru: defaultTemplates.appointments.newAppointment.ru({
        ...variables,
        botLink: `https://t.me/denteuzbot?start=${token}`
      }).sms
    };

    // Send SMS in both languages
    await Promise.all([
      sendSMS({
        phone: patient.phone,
        text: template.uz
      }),
      sendSMS({
        phone: patient.phone,
        text: template.ru
      })
    ]);

    console.log('Successfully sent appointment notification via SMS');
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
}