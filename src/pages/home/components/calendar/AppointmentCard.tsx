import React from 'react';
import { Play, Edit2 } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onClick: (appointment: Appointment, event: React.MouseEvent) => void;
  width?: string;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStartAppointment,
  onEditAppointment,
  onClick,
  width = 'w-full'
}) => {
  const { language } = useLanguageStore();

  return (
    <div
      style={{ width }}
      className={`p-2 rounded-lg transition-colors cursor-pointer ${
        appointment.status === 'confirmed'
          ? 'bg-green-50 border border-green-100 hover:bg-green-100'
          : appointment.status === 'cancelled'
          ? 'bg-red-50 border border-red-100 hover:bg-red-100'
          : appointment.status === 'completed'
          ? 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
          : 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100'
      }`}
      onClick={(e) => onClick(appointment, e)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {appointment.patient.avatar_url ? (
            <img 
              src={appointment.patient.avatar_url} 
              alt={appointment.patient.full_name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-indigo-600">
                {appointment.patient.full_name.charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate max-w-[150px]">
              {appointment.patient.full_name}
            </h3>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartAppointment(appointment);
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditAppointment(appointment);
            }}
            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-sm text-gray-500">
          {appointment.patient.phone}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          appointment.status === 'confirmed'
            ? 'bg-green-100 text-green-800'
            : appointment.status === 'cancelled'
            ? 'bg-red-100 text-red-800'
            : appointment.status === 'completed'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-indigo-100 text-indigo-800'
        }`}>
          {appointment.status === 'confirmed'
            ? (language === 'uz' ? 'Tasdiqlangan' : 'Подтверждён')
            : appointment.status === 'cancelled'
            ? (language === 'uz' ? 'Bekor qilingan' : 'Отменён')
            : appointment.status === 'completed'
            ? (language === 'uz' ? 'Yakunlangan' : 'Завершён')
            : (language === 'uz' ? 'Kutilmoqda' : 'Ожидается')}
        </span>
      </div>
      {appointment.notes && (
        <p className="mt-2 text-sm text-gray-600 truncate max-w-[150px]">
          {appointment.notes}
        </p>
      )}
    </div>
  );
};