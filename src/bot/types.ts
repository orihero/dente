import { Message } from 'node-telegram-bot-api';

export interface Language {
  code: 'uz' | 'ru';
  label: string;
  flag: string;
}

export interface UserState {
  chatId: number;
  language?: Language;
  phone?: string;
  name?: string;
  step: 'START' | 'LANGUAGE_SELECTION' | 'CONTACT_REQUEST' | 'BIRTHDATE_REQUEST' | 'ADDRESS_REQUEST' | 'REGISTERED';
  registrationData?: {
    full_name: string;
    phone: string;
    birthdate?: string;
    address?: string;
  };
}