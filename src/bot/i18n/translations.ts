import { appointmentTranslations } from './translations/appointment.js';
import { registrationTranslations } from './translations/registration.js';
import { welcomeTranslations } from './translations/welcome.js';
import { menuTranslations } from './translations/menu.js';
import { errorTranslations } from './translations/errors.js';

export const translations = {
  uz: {
    appointment: appointmentTranslations.uz,
    registration: registrationTranslations.uz,
    welcome: welcomeTranslations.uz,
    menu: menuTranslations.uz,
    errors: errorTranslations.uz
  },
  ru: {
    appointment: appointmentTranslations.ru,
    registration: registrationTranslations.ru,
    welcome: welcomeTranslations.ru,
    menu: menuTranslations.ru,
    errors: errorTranslations.ru
  }
};

export { welcomeTranslations } from './translations/welcome.js';