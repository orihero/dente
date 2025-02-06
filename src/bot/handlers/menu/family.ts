import { escape_markdown_v2 } from '../../utils/formatters.js';
import { supabase } from '../../services/supabase.js';

export const handleFamilyMembers = async (bot: any, chatId: number, patient: any, language: 'uz' | 'ru') => {
  console.log('👨‍👩‍👧‍👦 Handling family members...');
  
  // Get family members
  const { data: familyMembers } = await supabase
    .from('family_members')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at');

  if (familyMembers && familyMembers.length > 0) {
    const message = language === 'uz'
      ? `👨‍👩‍👧‍👦 *Oila a'zolari*\n\n` +
        familyMembers.map(member => 
          `*${escape_markdown_v2(member.full_name)}*\n` +
          `Telefon: ${escape_markdown_v2(member.phone)}\n` +
          `Tug'ilgan sana: ${escape_markdown_v2(new Date(member.birthdate).toLocaleDateString('uz-UZ'))}\n`
        ).join('\n')
      : `👨‍👩‍👧‍👦 *Члены семьи*\n\n` +
        familyMembers.map(member => 
          `*${escape_markdown_v2(member.full_name)}*\n` +
          `Телефон: ${escape_markdown_v2(member.phone)}\n` +
          `Дата рождения: ${escape_markdown_v2(new Date(member.birthdate).toLocaleDateString('ru-RU'))}\n`
        ).join('\n');

    await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
  } else {
    await bot.sendMessage(
      chatId,
      language === 'uz' 
        ? 'Oila a\'zolari qo\'shilmagan'
        : 'Нет добавленных членов семьи'
    );
  }
};