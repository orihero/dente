import { supabase } from '../../services/supabase.js';
import { escape_markdown_v2 } from '../../utils/formatters.js';

export const handleClinicSelection = async (bot: any, chatId: number, patient: any, language: 'uz' | 'ru') => {
  try {
    // Get list of active clinics
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select(`
        *,
        dentists:dentists(
          id,
          full_name,
          experience,
          photo_url
        )
      `)
      .eq('enabled', true)
      .order('name_' + language);

    if (error) throw error;

    if (!clinics || clinics.length === 0) {
      await bot.sendMessage(
        chatId,
        language === 'uz'
          ? 'Hozirda faol klinikalar mavjud emas'
          : 'В данный момент нет активных клиник'
      );
      return;
    }

    // Format clinic list with inline keyboard
    const keyboard = clinics.map(clinic => [{
      text: language === 'uz' ? clinic.name_uz : clinic.name_ru,
      callback_data: `clinic_${clinic.id}`
    }]);

    // Send message with clinic list
    let message = language === 'uz'
      ? '*Mavjud klinikalar:*\n\n'
      : '*Доступные клиники:*\n\n';

    clinics.forEach((clinic, index) => {
      const name = escape_markdown_v2(language === 'uz' ? clinic.name_uz : clinic.name_ru);
      const address = escape_markdown_v2(language === 'uz' ? clinic.address_uz : clinic.address_ru);
      const dentistCount = clinic.dentists?.length || 0;

      message += `*${index + 1}\\. ${name}*\n`;
      if (address) {
        message += `📍 ${address}\n`;
      }
      message += `👨‍⚕️ ${dentistCount} ${language === 'uz' ? 'shifokor' : 'врачей'}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    console.error('Error handling clinic selection:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};

export const handleClinicSelectionMenu = async (bot: any, chatId: number, language: string) => {
  try {
    // Get list of active clinics
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select(`
        *,
        dentists:dentists(
          id,
          full_name,
          experience,
          photo_url
        )
      `)
      .eq('enabled', true)
      .order('name_' + language);

    if (error) throw error;

    if (!clinics || clinics.length === 0) {
      await bot.sendMessage(
        chatId,
        language === 'uz'
          ? 'Hozirda faol klinikalar mavjud emas'
          : 'В данный момент нет активных клиник'
      );
      return;
    }

    // Format clinic list with inline keyboard
    const keyboard = clinics.map(clinic => [{
      text: language === 'uz' ? clinic.name_uz : clinic.name_ru,
      callback_data: `clinic_${clinic.id}`
    }]);

    // Send message with clinic list
    let message = language === 'uz'
      ? '*Mavjud klinikalar:*\n\n'
      : '*Доступные клиники:*\n\n';

    clinics.forEach((clinic, index) => {
      const name = escape_markdown_v2(language === 'uz' ? clinic.name_uz : clinic.name_ru);
      const address = escape_markdown_v2(language === 'uz' ? clinic.address_uz : clinic.address_ru);
      const dentistCount = clinic.dentists?.length || 0;

      message += `*${index + 1}\\. ${name}*\n`;
      if (address) {
        message += `📍 ${address}\n`;
      }
      message += `👨‍⚕️ ${dentistCount} ${language === 'uz' ? 'shifokor' : 'врачей'}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    console.error('Error handling clinic selection:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};