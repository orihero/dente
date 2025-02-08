import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { MonthYearSelector } from './MonthYearSelector';
import { ViewSwitch } from './ViewSwitch';
import { FilterModal, FilterOptions } from './FilterModal';
import { Appointment } from '../../types';

interface CalendarViewProps {
  view: 'daily' | 'weekly';
  onViewChange: (view: 'daily' | 'weekly') => void;
  selectedDate: Date;
  appointments: Appointment[];
  onStartAppointment: (appointment: Appointment) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onCreateAppointment: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  appointments,
  onStartAppointment,
  onEditAppointment,
  onCreateAppointment
}) => {
  const { language } = useLanguageStore();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: ['pending', 'confirmed'],
    sortBy: 'time',
    sortOrder: 'asc'
  });

  const handleNavigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const handleNavigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(newDate);
  };

  const t = translations[language].home;

  const filteredAppointments = appointments
    .filter(apt => filters.status.includes(apt.status))
    .sort((a, b) => {
      if (filters.sortBy === 'time') {
        return filters.sortOrder === 'asc'
          ? new Date(a.appointment_time).getTime() - new Date(b.appointment_time).getTime()
          : new Date(b.appointment_time).getTime() - new Date(a.appointment_time).getTime();
      } else {
        return filters.sortOrder === 'asc'
          ? a.patient.full_name.localeCompare(b.patient.full_name)
          : b.patient.full_name.localeCompare(a.patient.full_name);
      }
    });

  return (
    <div className="flex-1 bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t.appointments}
          </h2>
          <MonthYearSelector 
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            onNavigateDay={handleNavigateDay}
            onNavigateWeek={handleNavigateWeek}
            view={view}
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-5 h-5" />
            <span>{language === 'uz' ? 'Filtrlash' : 'Фильтры'}</span>
          </button>
          <ViewSwitch view={view} onViewChange={onViewChange} />
        </div>
      </div>
      
      {view === 'daily' ? (
        <DailyView
          selectedDate={selectedDate}
          appointments={filteredAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_time);
            return aptDate.toDateString() === selectedDate.toDateString();
          })}
          onStartAppointment={onStartAppointment}
          onEditAppointment={onEditAppointment}
          onCreateAppointment={onCreateAppointment}
        />
      ) : (
        <WeeklyView
          selectedDate={selectedDate}
          appointments={filteredAppointments}
          onStartAppointment={onStartAppointment}
          onEditAppointment={onEditAppointment}
          onCreateAppointment={onCreateAppointment}
        />
      )}

      <FilterModal
        show={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </div>
  );
};