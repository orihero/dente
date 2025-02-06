// Function to format date and time
export const formatDateTime = (dateString: string, language: 'uz' | 'ru' = 'uz'): string => {
  const date = new Date(dateString);
  return date.toLocaleString(
    language === 'uz' ? 'uz-UZ' : 'ru-RU',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  ).replace(/\//g, '.');
};

// Function to escape special characters for Telegram Markdown V2
export const escapeMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1')
    .replace(/\\([.])/g, '\\$1'); // Double escape dots
};

// Alias for backward compatibility
export const escape_markdown_v2 = escapeMarkdown;