import React from 'react';
import { X, Play, Edit2 } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';

interface HourAppointmentsModalProps {
  show: boolean;
  onClose: () => void;
  hour: number | null;
  appointments: Appointment[];
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
}

export const HourAppointmentsModal: React.FC<HourAppointmentsModalProps> = ({
  show,
  onClose,
  hour,
  appointments,
  onStartAppointment,
  onEditAppointment
}) => {
  const { language } = useLanguageStore();

  if (!show || hour === null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {hour.toString().padStart(2, '0')}:00 - {(hour + 1).toString().padStart(2, '0')}:00
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer"
                onClick={() => onEditAppointment(appointment)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {appointment.patient.full_name}
                    </h3>
                    <p className="text-sm text-indigo-600">
                      {new Date(appointment.appointment_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1">
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
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {appointment.notes}
                  </p>
                )}
                <div className="mt-2 flex gap-2 text-sm text-gray-500">
                  <span>{appointment.patient.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};