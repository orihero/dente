import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '../../../../store/languageStore';
import { Appointment } from '../../types';
import { HourAppointmentsModal } from './HourAppointmentsModal';
import { AppointmentTooltip } from './AppointmentTooltip';

interface WeeklyViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCreateAppointment: (date: Date) => void;
}

export const WeeklyView: React.FC<WeeklyViewProps> = ({
  selectedDate,
  appointments,
  onStartAppointment,
  onEditAppointment,
  onCreateAppointment
}) => {
  const { language } = useLanguageStore();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showHourModal, setShowHourModal] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const dayNames = {
    uz: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
    ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']
  };

  const months = {
    uz: [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ],
    ru: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
  };

  // Get start of week (Monday)
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + (selectedDate.getDay() === 0 ? -6 : 1));

  // Get week days
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });

  const getHourAppointments = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_time);
      return aptDate.getDate() === date.getDate() &&
             aptDate.getMonth() === date.getMonth() &&
             aptDate.getHours() === hour;
    });
  };

  const handleAppointmentClick = (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.bottom });
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

  return (
    <div className="divide-y">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-white z-20">
        <div className="w-20" /> {/* Empty cell for time column */}
        {weekDates.map((date, index) => (
          <div
            key={date.toISOString()}
            className={`p-4 text-center ${
              date.toDateString() === new Date().toDateString()
                ? 'bg-indigo-50'
                : ''
            }`}
          >
            <div className="text-sm font-medium">
              {dayNames[language][date.getDay() === 0 ? 6 : date.getDay() - 1]}
            </div>
            <div className="text-sm text-gray-500">
              {date.getDate()} {months[language][date.getMonth()]}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      {Array.from({ length: 13 }, (_, i) => i + 9).map((hour) => (
        <div key={hour} className="grid grid-cols-8">
          {/* Time indicator */}
          <div className="w-20 py-4 px-2 text-right text-sm text-gray-500">
            {`${hour.toString().padStart(2, '0')}:00`}
          </div>
          
          {/* Day slots */}
          {weekDates.map((date) => {
            const hourAppointments = getHourAppointments(date, hour);
            const displayAppointments = hourAppointments.slice(0, 2);
            const hasMore = hourAppointments.length > 2;

            return (
              <div 
                key={date.toISOString()} 
                className="relative min-h-[100px] border-l cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  const appointmentDate = new Date(date);
                  appointmentDate.setHours(hour, 0, 0, 0);
                  onCreateAppointment(appointmentDate);
                }}
              >
                {displayAppointments.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className={`absolute mx-1 my-1 p-2 rounded-lg 
                      ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-50 border border-red-100 hover:bg-red-100'
                          : appointment.status === 'completed'
                          ? 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                          : 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100'
                      }
                      transition-colors cursor-pointer text-sm 
                      flex items-center gap-2`}
                    style={{
                      left: `${(index * 100)}%`,
                      width: 'calc(100% - 8px)',
                      height: 'calc(100% - 8px)'
                    }}
                    onClick={(e) => handleAppointmentClick(appointment, e)}
                  >
                    {appointment.patient.avatar_url ? (
                      <img 
                        src={appointment.patient.avatar_url} 
                        alt={appointment.patient.full_name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-indigo-600">
                          {appointment.patient.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mb-1 ${
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
                      <h3 className="font-medium text-gray-900 truncate max-w-[100px]">
                        {appointment.patient.full_name}
                      </h3>
                      <p className="text-xs text-indigo-600">
                        {new Date(appointment.appointment_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={() => {
                      setSelectedHour(hour);
                      setSelectedDay(date);
                      setShowHourModal(true);
                    }}
                    className="absolute right-2 top-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    +{hourAppointments.length - 2} more
                  </button>
                )}

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
          })}
        </div>
      ))}

      {/* Hour Appointments Modal */}
      <HourAppointmentsModal
        show={showHourModal}
        onClose={() => {
          setShowHourModal(false);
          setSelectedHour(null);
          setSelectedDay(null);
        }}
        hour={selectedHour}
        appointments={selectedHour !== null && selectedDay !== null
          ? getHourAppointments(selectedDay, selectedHour)
          : []
        }
        onStartAppointment={onStartAppointment}
        onEditAppointment={onEditAppointment}
      />
    </div>
  );
};