import { escape_markdown_v2 } from '../../utils/formatters.js';
import { supabase } from '../../services/supabase.js';

export const handleReferralProgram = async (bot: any, chatId: number, patient: any, language: 'uz' | 'ru') => {
  console.log('🔗 Handling referral program...');
  
  // Get referral link
  const referralLink = `https://t.me/denteuzbot?start=${patient.id}`;
  const message = language === 'uz'
    ? `🔗 *Referal dasturi*\n\n` +
      `Ushbu havola orqali do'stlaringizni taklif qiling va chegirmalarga ega bo'ling\\!\n\n` +
      `${escape_markdown_v2(referralLink)}`
    : `🔗 *Реферальная программа*\n\n` +
      `Пригласите друзей по этой ссылке и получите скидки\\!\n\n` +
      `${escape_markdown_v2(referralLink)}`;

  await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
};