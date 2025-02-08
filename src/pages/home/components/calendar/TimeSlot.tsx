import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';
import { AppointmentCard } from './AppointmentCard';
import { ChevronDown } from 'lucide-react';

interface TimeSlotProps {
  hour: number;
  appointments: Appointment[];
  onCreateAppointment: (date: Date) => void;
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onAppointmentClick: (appointment: Appointment, event: React.MouseEvent) => void;
  selectedDate: Date;
}

export const TimeSlot: React.FC<TimeSlotProps> = ({
  hour,
  appointments,
  onCreateAppointment,
  onStartAppointment,
  onEditAppointment,
  onAppointmentClick,
  selectedDate
}) => {
  const { language } = useLanguageStore();
  const appointmentWidth = appointments.length > 0 
    ? `calc(${100 / appointments.length}% - 8px)` 
    : 'calc(100% - 8px)';

  return (
    <div className="flex">
      {/* Time indicator */}
      <div className="w-20 py-4 px-2 text-right text-sm text-gray-500">
        {`${hour.toString().padStart(2, '0')}:00`}
      </div>
      
      {/* Appointment slot */}
      <div 
        className="flex-1 border-l min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => {
          const date = new Date(selectedDate);
          date.setHours(hour, 0, 0, 0);
          onCreateAppointment(date);
        }}
      >
        <div className="flex gap-2 p-1">
          {appointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onStartAppointment={onStartAppointment}
              onEditAppointment={onEditAppointment}
              onClick={onAppointmentClick}
              width={appointmentWidth}
            />
          ))}
        </div>
      </div>
    </div>
  );
};