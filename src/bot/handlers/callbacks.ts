import { CallbackQuery } from 'node-telegram-bot-api';
import { supabase } from '../services/supabase.js';
import { handleLanguageSelection } from './language.js';
import { handleClinicSelection } from './menu/clinics.js';
import { handleDentistSelection } from './menu/dentists.js';
import { handleAppointmentAction, handleTimeSelection } from './menu/appointments.js';
import { getMainMenuKeyboard } from './menu/index.js';

export const handleCallbacks = async (bot: any, query: CallbackQuery) => {
  if (!query.message || !query.data) return;

  const chatId = query.message.chat.id;
  const [action, ...params] = query.data.split('_');
  const id = params.join('_'); // Rejoin in case id contains underscores

  // Get patient's language
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('language')
    .eq('telegram_chat_id', chatId.toString())
    .single();

  if (patientError) throw patientError;
  const language = patient?.language || 'uz';

  try {
    switch (action) {
      case 'language':
        await handleLanguageSelection(bot, query);
        break;

      case 'clinic':
        // Show dentists for selected clinic
        await handleDentistSelection(bot, chatId, id, language);
        break;

      case 'dentist':
        // Update patient's dentist
        const { error: updateError } = await supabase
          .from('patients')
          .update({ dentist_id: id })
          .eq('telegram_chat_id', chatId.toString());

        if (updateError) throw updateError;

        // Get dentist info
        const { data: dentist, error: dentistError } = await supabase
          .from('dentists')
          .select('*')
          .eq('id', id)
          .single();

        if (dentistError) throw dentistError;

        // Send confirmation and show main menu
        await bot.sendMessage(
          chatId,
          language === 'uz'
            ? `✅ ${dentist.full_name} shifokor tanlandi`
            : `✅ Выбран врач ${dentist.full_name}`,
          { reply_markup: getMainMenuKeyboard(language) }
        );
        break;

      case 'confirm':
      case 'cancel':
      case 'reschedule':
        await handleAppointmentAction(bot, query, language);
        break;

      case 'time':
        await handleTimeSelection(bot, query, language);
        break;
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};