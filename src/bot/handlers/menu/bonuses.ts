import { escape_markdown_v2 } from '../../utils/formatters.js';
import { supabase } from '../../services/supabase.js';

export const handleBonuses = async (bot: any, chatId: number, patient: any, language: 'uz' | 'ru') => {
  console.log('🎁 Handling bonuses...');
  
  // Get active loyalty programs
  const { data: programs } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('dentist_id', patient.dentist.id)
    .eq('enabled', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date');

  if (programs && programs.length > 0) {
    const message = language === 'uz'
      ? `🎁 *Faol chegirmalar*\n\n` +
        programs.map(program => 
          `*${escape_markdown_v2(program.name_uz)}*\n` +
          `${escape_markdown_v2(program.description_uz)}\n` +
          `Chegirma: ${program.percentage}%\n` +
          `Amal qilish muddati: ${escape_markdown_v2(new Date(program.end_date).toLocaleDateString('uz-UZ'))}\n`
        ).join('\n')
      : `🎁 *Активные скидки*\n\n` +
        programs.map(program => 
          `*${escape_markdown_v2(program.name_ru)}*\n` +
          `${escape_markdown_v2(program.description_ru)}\n` +
          `Скидка: ${program.percentage}%\n` +
          `Действует до: ${escape_markdown_v2(new Date(program.end_date).toLocaleDateString('ru-RU'))}\n`
        ).join('\n');

    await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
  } else {
    await bot.sendMessage(
      chatId,
      language === 'uz'
        ? 'Hozirda faol chegirmalar mavjud emas'
        : 'В данный момент нет активных скидок'
    );
  }
};