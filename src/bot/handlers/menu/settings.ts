import { languageKeyboard, settingsKeyboard, mainMenuKeyboard } from '../../keyboards.js';

export const handleSettings = async (bot: any, chatId: number, language: 'uz' | 'ru') => {
  console.log('⚙️ Opening settings...');
  await bot.sendMessage(
    chatId,
    language === 'uz' ? '⚙️ Sozlamalar' : '⚙️ Настройки',
    { reply_markup: settingsKeyboard[language] }
  );
};

export const handleBack = async (bot: any, chatId: number, language: 'uz' | 'ru') => {
  console.log('↩️ Going back to main menu...');
  await bot.sendMessage(
    chatId,
    language === 'uz' ? '🏥 Asosiy menyu' : '🏥 Главное меню',
    { reply_markup: mainMenuKeyboard[language] }
  );
};

export const handleLanguageChange = async (bot: any, chatId: number) => {
  console.log('🌐 Opening language selection...');
  await bot.sendMessage(
    chatId,
    'Tilni tanlang / Выберите язык:',
    {
      parse_mode: 'MarkdownV2',
      reply_markup: languageKeyboard
    }
  );
};