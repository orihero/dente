import React, { useState, useEffect, useRef } from 'react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';
import { HourAppointmentsModal } from './HourAppointmentsModal';
import { AppointmentTooltip } from './AppointmentTooltip';
import { TimeSlot } from './TimeSlot';

interface DailyViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCreateAppointment: (date: Date) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  selectedDate,
  appointments,
  onStartAppointment,
  onEditAppointment,
  onCreateAppointment
}) => {
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showHourModal, setShowHourModal] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { language } = useLanguageStore();

  useEffect(() => {
    // Scroll to current time on mount and when date changes
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      if (currentHour >= 9 && currentHour <= 21) {
        const hourElement = timelineRef.current.children[currentHour - 9];
        if (hourElement) {
          hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedDate]);

  const handleAppointmentClick = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left+130, y: rect.bottom });
    setSelectedAppointment(appointment);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedAppointment && !(event.target as Element).closest('.appointment-tooltip')) {
        setSelectedAppointment(null);
        setTooltipPosition(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedAppointment]);

  const getHourAppointments = (hour: number) => {
    return appointments.filter(apt => {
      const aptHour = new Date(apt.appointment_time).getHours();
      return aptHour === hour;
    });
  };

  // Get current time
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimePosition = ((currentHour - 9) * 100) + ((currentMinute / 60) * 100);

  return (
    <div className="divide-y relative" ref={timelineRef}>
      {/* Current time indicator */}
      {selectedDate.toDateString() === now.toDateString() && currentHour >= 9 && currentHour <= 21 && (
        <div 
          className="absolute left-20 right-0 border-t-2 border-red-500 border-dashed z-10 pointer-events-none"
          style={{ top: `${currentTimePosition}px` }}
        >
          <div className="absolute -left-20 -top-3 w-16 text-right">
            <span className="text-sm font-medium text-red-500">
              {currentHour.toString().padStart(2, '0')}:{currentMinute.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {Array.from({ length: 13 }, (_, i) => i + 9).map((hour) => (
        <TimeSlot
          key={hour}
          hour={hour}
          appointments={getHourAppointments(hour)}
          onCreateAppointment={onCreateAppointment}
          onStartAppointment={onStartAppointment}
          onEditAppointment={onEditAppointment}
          onAppointmentClick={handleAppointmentClick}
          selectedDate={selectedDate}
          onShowMore={(hour) => {
            setSelectedHour(hour);
            setShowHourModal(true);
          }}
        />
      ))}

      {/* Hour Appointments Modal */}
      <HourAppointmentsModal
        show={showHourModal}
        onClose={() => {
          setShowHourModal(false);
          setSelectedHour(null);
        }}
        hour={selectedHour}
        appointments={selectedHour !== null ? getHourAppointments(selectedHour) : []}
        onStartAppointment={onStartAppointment}
        onEditAppointment={onEditAppointment}
      />

      {/* Appointment Tooltip */}
      {selectedAppointment && tooltipPosition && (
        <AppointmentTooltip
          appointment={selectedAppointment}
          position={tooltipPosition}
          onStartAppointment={onStartAppointment}
          onEditAppointment={onEditAppointment}
        />
      )}
    </div>
  );
};