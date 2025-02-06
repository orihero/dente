import { Message } from 'node-telegram-bot-api';
import { supabase } from '../../services/supabase.js';
import { menuTranslations } from '../../i18n/translations/menu.js';
import { handleAppointments } from '../appointments.js';
import { handleRecords } from '../records.js';
import { handleRequests } from '../requests.js';
import { handleClinicSelection } from './clinics.js';
import { handleDentistSelection } from './dentists.js';
import { handleDoctorInfo } from './doctor.js';
import { handleFamilyMembers } from './family.js';
import { handleBonuses } from './bonuses.js';
import { handleReferralProgram } from './referral.js';
import { handleSettings, handleBack, handleLanguageChange } from './settings.js';
import { mainMenuKeyboard, newUserMenuKeyboard } from '../../keyboards.js';

// Export keyboard getter for other modules
export const getMainMenuKeyboard = (language: 'uz' | 'ru') => mainMenuKeyboard[language];
export const getNewUserMenuKeyboard = (language: 'uz' | 'ru') => ({
  keyboard: newUserMenuKeyboard[language].keyboard,
  resize_keyboard: true
});

export const handleMenu = async (bot: any, msg: Message) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log('📋 Menu handler called:', { chatId, text });
  
  try {
    // First get patient data
    console.log('🔍 Fetching patient data...');
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        dentist:dentists(
          id,
          full_name,
          phone,
          social_media,
          birthdate,
          photo_url,
          clinic:clinics(
            id,
            name_uz,
            name_ru,
            address_uz,
            address_ru,
            phone_numbers,
            emails,
            website,
            working_hours
          )
        )
      `)
      .eq('telegram_chat_id', chatId.toString())
      .single();

    if (patientError && patientError.code !== 'PGRST116') {
      throw patientError;
    }

    // Then try to get dentist data if patient not found
    if (!patient) {
      console.log('🔍 Patient not found, checking dentist data...');
      const { data: dentist, error: dentistError } = await supabase
        .from('dentists')
        .select(`
          *,
          clinic:clinics(
            id,
            name_uz,
            name_ru,
            address_uz,
            address_ru
          )
        `)
        .eq('telegram_bot_chat_id', chatId.toString())
        .single();

      if (dentistError) throw dentistError;
      if (!dentist) {
        console.error('❌ No user found for chat ID:', chatId);
        return;
      }

      // Use the language from the message sender's language code as fallback
      const language = msg.from?.language_code === 'ru' ? 'ru' : 'uz';
      console.log('🌐 Using language:', language);
      const t = menuTranslations[language];

      // Handle dentist menu options
      console.log('📋 Handling dentist menu option:', text);
      switch (text) {
        case t.mainMenu.myRequests:
          await handleRequests(bot, chatId, dentist);
          break;

        case t.mainMenu.settings:
          await handleSettings(bot, chatId, language);
          break;

        case t.settings.back:
          await handleBack(bot, chatId, language);
          break;

        case t.settings.changeLanguage:
          await handleLanguageChange(bot, chatId);
          break;

        default:
          // Send "coming soon" message for unimplemented features
          if (Object.values(t.mainMenu).includes(text)) {
            console.log('⏳ Sending "coming soon" message for:', text);
            await bot.sendMessage(
              chatId,
              language === 'uz'
                ? 'Bu funksiya tez orada qo\'shiladi'
                : 'Эта функция будет добавлена в ближайшее время'
            );
          }
          break;
      }
    } else {
      // Handle patient menu options
      const language = patient.language || (msg.from?.language_code === 'ru' ? 'ru' : 'uz');
      console.log('🌐 Using language:', language);
      const t = menuTranslations[language];

      console.log('📋 Handling patient menu option:', text);
      
      // Handle clinic selection
      if (text === '🏥 Klinikani tanlash' || text === '🏥 Выбрать клинику') {
        await handleClinicSelection(bot, chatId, patient, language);
        return;
      }

      switch (text) {
        case t.mainMenu.myDoctor:
          await handleDoctorInfo(bot, chatId, patient, language);
          break;

        case t.mainMenu.myRecords:
          await handleRecords(bot, chatId, patient);
          break;

        case t.mainMenu.myAppointments:
          await handleAppointments(bot, chatId, patient);
          break;

        case t.mainMenu.myFamily:
          await handleFamilyMembers(bot, chatId, patient, language);
          break;

        case t.mainMenu.myBonuses:
          await handleBonuses(bot, chatId, patient, language);
          break;

        case t.mainMenu.settings:
          await handleSettings(bot, chatId, language);
          break;

        case t.settings.back:
          await handleBack(bot, chatId, language);
          break;

        case t.settings.changeLanguage:
          await handleLanguageChange(bot, chatId);
          break;

        case t.settings.referralProgram:
          await handleReferralProgram(bot, chatId, patient, language);
          break;

        default:
          // Send "coming soon" message for unimplemented features
          if (Object.values(t.mainMenu).includes(text)) {
            console.log('⏳ Sending "coming soon" message for:', text);
            await bot.sendMessage(
              chatId,
              language === 'uz'
                ? 'Bu funksiya tez orada qo\'shiladi'
                : 'Эта функция будет добавлена в ближайшее время'
            );
          }
          break;
      }
    }
  } catch (error) {
    console.error('❌ Error handling menu:', error);
    await bot.sendMessage(
      chatId,
      msg.from?.language_code === 'ru'
        ? 'Произошла ошибка. Пожалуйста, попробуйте позже.'
        : 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
    );
  }
};