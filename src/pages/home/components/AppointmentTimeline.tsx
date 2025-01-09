import React from 'react';
import { Clock, Play, Edit } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatTime } from '../../../utils/dateUtils';

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  notes: string;
  patient: Patient;
}

interface AppointmentTimelineProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export const AppointmentTimeline: React.FC<AppointmentTimelineProps> = ({ 
  appointments,
  onAppointmentClick,
  onStartAppointment,
  onEditAppointment
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;

  if (appointments.length === 0) {
    return <div className="text-center py-8 text-gray-500">{t.noAppointments}</div>;
  }

  return (
    <div className="space-y-0">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="relative"
        >
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="relative flex gap-6 py-4">
            <div className="relative z-10">
              <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {appointment.patient.full_name}
                  </h3>
                  <p className="text-sm text-indigo-600 font-medium">
                    {formatTime(appointment.appointment_time, language)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartAppointment(appointment);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title={language === 'uz' ? "Qabulni boshlash" : "Начать приём"}
                  >
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'uz' ? "Boshlash" : "Начать"}
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditAppointment(appointment);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title={t.edit}
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">{t.edit}</span>
                  </button>
                </div>
              </div>
              <div 
                className="mt-2 cursor-pointer"
                onClick={() => onAppointmentClick(appointment)}
              >
                {appointment.notes && (
                  <p className="text-sm text-gray-600 max-w-md mt-2 bg-gray-50 p-2 rounded">
                    {appointment.notes}
                  </p>
                )}
                <div className="mt-2 flex gap-2 text-sm text-gray-500">
                  <span>{appointment.patient.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};