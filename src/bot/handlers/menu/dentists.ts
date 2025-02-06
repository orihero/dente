import { supabase } from '../../services/supabase.js';
import { escape_markdown_v2 } from '../../utils/formatters.js';

export const handleDentistSelection = async (bot: any, chatId: number, clinicId: string, language: 'uz' | 'ru') => {
  try {
    // Get list of dentists for the clinic
    const { data: dentists, error } = await supabase
      .from('dentists')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('type', 'regular')
      .order('full_name');

    if (error) throw error;

    if (!dentists || dentists.length === 0) {
      await bot.sendMessage(
        chatId,
        language === 'uz'
          ? 'Bu klinikada hozirda shifokorlar mavjud emas'
          : 'В данной клинике пока нет врачей'
      );
      return;
    }

    // Format dentist list with inline keyboard
    const keyboard = dentists.map(dentist => [{
      text: dentist.full_name,
      callback_data: `dentist_${dentist.id}`
    }]);

    // Send message with dentist list
    let message = language === 'uz'
      ? '*Mavjud shifokorlar:*\n\n'
      : '*Доступные врачи:*\n\n';

    dentists.forEach((dentist, index) => {
      const name = escape_markdown_v2(dentist.full_name);
      const experience = dentist.experience || 0;

      message += `*${index + 1}\\. ${name}*\n`;
      message += `👨‍⚕️ ${experience} ${language === 'uz' ? 'yillik tajriba' : 'лет опыта'}\n\n`;
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    console.error('Error handling dentist selection:', error);
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    );
  }
};