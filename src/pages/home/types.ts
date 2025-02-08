export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
  avatar_url?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  patient: Patient;
  services?: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    warranty: string;
  }>;
}