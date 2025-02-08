import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { formatDate } from '../../../../utils/dateUtils';

interface MonthYearSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onNavigateDay?: (direction: 'prev' | 'next') => void;
  onNavigateWeek?: (direction: 'prev' | 'next') => void;
  view?: 'daily' | 'weekly';
}

export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  selectedDate,
  onDateChange,
  onNavigateDay,
  onNavigateWeek,
  view
}) => {
  const { language } = useLanguageStore();

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

  const handlePrevMonth = () => {
    if (view === 'daily' && onNavigateDay) {
      onNavigateDay('prev');
      return;
    }

    if (view === 'weekly' && onNavigateWeek) {
      onNavigateWeek('prev');
      return;
    }

    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    if (view === 'daily' && onNavigateDay) {
      onNavigateDay('next');
      return;
    }

    if (view === 'weekly' && onNavigateWeek) {
      onNavigateWeek('next');
      return;
    }

    const newDate = new Date(selectedDate);
    newDate.setMonth(selectedDate.getMonth() + 1);
    onDateChange(newDate);
  };

  return (
    <div className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={handlePrevMonth}
        className="p-2 hover:bg-gray-50 rounded-l-lg border-r"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <div className="px-4 py-2 min-w-[160px] text-center">
        <span className="font-medium whitespace-nowrap">
          {view === 'weekly' || view === 'daily' ? (
            formatDate(selectedDate, language)
          ) : (
            `${months[language][selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
          )}
        </span>
      </div>
      
      <button
        onClick={handleNextMonth}
        className="p-2 hover:bg-gray-50 rounded-r-lg border-l"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};