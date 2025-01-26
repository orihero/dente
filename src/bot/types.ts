// Add global declarations
declare global {
  var cancelContext: Record<number, string>;
}

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
  dentistId?: string;
}

export interface AppointmentData {
  id: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  dentist: {
    id: string;
    full_name: string;
    telegram_bot_chat_id?: string;
    clinic?: {
      id: string;
      working_hours: WorkingHours;
    };
  };
  patient: {
    full_name: string;
  };
}

export interface WorkingHours {
  [key: string]: {
    open: string;
    close: string;
  } | null;
}

export interface Clinic {
  id: string;
  working_hours: WorkingHours;
}

export interface Dentist {
  id: string;
  full_name: string;
  clinic: Clinic;
}

export interface Appointment {
  id: string;
  dentist: Dentist;
  patient: {
    full_name: string;
  };
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}