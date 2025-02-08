import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatDate } from '../../../utils/dateUtils';

interface DateNavigationProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  navigateDay: (days: number) => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  setSelectedDate,
  navigateDay,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  
  const weekDays = {
    uz: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'],
    ru: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
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

  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold">
          {months[language][selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </h2>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays[language].map((day) => (
          <div key={day} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }, (_, i) => {
          const date = new Date(selectedDate);
          date.setDate(1);
          const firstDay = date.getDay() || 7;
          date.setDate(i - firstDay + 2);
          
          const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(new Date(date))}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full
                ${isCurrentMonth ? 'hover:bg-gray-100' : 'text-gray-300'}
                ${isToday ? 'font-bold text-indigo-600' : ''}
                ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
              `}
              disabled={!isCurrentMonth}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};