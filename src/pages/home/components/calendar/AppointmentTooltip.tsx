import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';

interface AppointmentTooltipProps {
  appointment: Appointment;
  position: { x: number; y: number };
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export const AppointmentTooltip: React.FC<AppointmentTooltipProps> = ({
  appointment,
  position,
  onStartAppointment,
  onEditAppointment
}) => {
  const { language } = useLanguageStore();

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg border p-4 w-64 appointment-tooltip shadow-sm"
      style={{
        left: position.x,
        top: position.y + 4,
        transform: 'translateX(-50%)'
      }}
    >
      <div className="flex items-start gap-3">
        {appointment.patient.avatar_url ? (
          <img 
            src={appointment.patient.avatar_url} 
            alt={appointment.patient.full_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-lg font-medium text-indigo-600">
              {appointment.patient.full_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate max-w-[180px]">
            {appointment.patient.full_name}
          </h3>
          <p className="text-sm text-indigo-600">
            {new Date(appointment.appointment_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {appointment.patient.phone}
          </p>
        </div>
      </div>

      {appointment.notes && (
        <p className="text-sm text-gray-600 border-t pt-2 mt-2">
          {appointment.notes}
        </p>
      )}

      {appointment.services && appointment.services.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <p className="text-xs font-medium text-gray-500 mb-1">
            {language === 'uz' ? 'Xizmatlar' : 'Услуги'}
          </p>
          <div className="space-y-1">
            {appointment.services.map((service) => (
              <div key={service.id} className="text-sm text-gray-600">
                {service.name}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-3 mt-2 border-t">
        <button
          onClick={() => onStartAppointment(appointment)}
          className="flex-1 bg-green-600 text-white text-sm py-1 px-3 rounded hover:bg-green-700"
        >
          {language === 'uz' ? 'Boshlash' : 'Начать'}
        </button>
        <button
          onClick={() => onEditAppointment(appointment)}
          className="flex-1 bg-indigo-600 text-white text-sm py-1 px-3 rounded hover:bg-indigo-700"
        >
          {language === 'uz' ? 'Tahrirlash' : 'Изменить'}
        </button>
      </div>
    </div>
  );
};