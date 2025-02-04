import { supabase } from '../services/supabase.js';
import { escape_markdown_v2 } from '../utils/formatters.js';
import { formatDateTime } from '../utils/dateUtils.js';

export const handleRequests = async (bot: any, chatId: number, dentist: any) => {
  try {
    // Get requests for this dentist
    const { data: requests, error } = await supabase
      .from('dentist_requests')
      .select('*')
      .eq('dentist_id', dentist.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!requests || requests.length === 0) {
      await bot.sendMessage(
        chatId,
        dentist.language === 'uz'
          ? 'Sizda hozircha so\'rovlar yo\'q'
          : 'У вас пока нет запросов'
      );
      return;
    }

    // Get request type labels
    const requestTypes = {
      feature: {
        uz: 'Yangi funksiya',
        ru: 'Новая функция'
      },
      bug: {
        uz: 'Xatolik',
        ru: 'Ошибка'
      },
      suggestion: {
        uz: 'Taklif',
        ru: 'Предложение'
      },
      support: {
        uz: 'Yordam',
        ru: 'Поддержка'
      }
    };

    // Get status labels
    const statusLabels = {
      pending: {
        uz: 'Kutilmoqda',
        ru: 'Ожидает'
      },
      in_progress: {
        uz: 'Jarayonda',
        ru: 'В процессе'
      },
      resolved: {
        uz: 'Hal qilindi',
        ru: 'Решено'
      },
      rejected: {
        uz: 'Rad etildi',
        ru: 'Отклонено'
      }
    };

    // Send each request as a separate message
    for (const request of requests) {
      let message = dentist.language === 'uz'
        ? `📝 *So'rov #${request.id}*\n\n`
        : `📝 *Запрос #${request.id}*\n\n`;

      // Add request type
      message += dentist.language === 'uz'
        ? `*Turi:* ${requestTypes[request.type as keyof typeof requestTypes]?.uz || request.type}\n`
        : `*Тип:* ${requestTypes[request.type as keyof typeof requestTypes]?.ru || request.type}\n`;

      // Add status
      message += dentist.language === 'uz'
        ? `*Holat:* ${statusLabels[request.status as keyof typeof statusLabels]?.uz || request.status}\n`
        : `*Статус:* ${statusLabels[request.status as keyof typeof statusLabels]?.ru || request.status}\n`;

      // Add date
      message += dentist.language === 'uz'
        ? `*Sana:* ${escape_markdown_v2(formatDateTime(request.created_at))}\n\n`
        : `*Дата:* ${escape_markdown_v2(formatDateTime(request.created_at))}\n\n`;

      // Add description
      message += dentist.language === 'uz'
        ? `*So'rov mazmuni:*\n${escape_markdown_v2(request.description)}`
        : `*Содержание запроса:*\n${escape_markdown_v2(request.description)}`;

      // Add admin notes if any
      if (request.admin_notes) {
        message += dentist.language === 'uz'
          ? `\n\n*Admin izohi:*\n${escape_markdown_v2(request.admin_notes)}`
          : `\n\n*Примечание администратора:*\n${escape_markdown_v2(request.admin_notes)}`;
      }

      await bot.sendMessage(chatId, message, { parse_mode: 'MarkdownV2' });
    }
  } catch (error) {
    console.error('Error handling requests:', error);
    await bot.sendMessage(
      chatId,
      dentist.language === 'uz'
        ? 'So\'rovlarni yuklashda xatolik yuz berdi'
        : 'Ошибка при загрузке запросов'
    );
  }
};