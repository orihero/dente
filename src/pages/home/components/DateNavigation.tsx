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

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => navigateDay(-1)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-center">
        <span className="text-lg font-medium">{formatDate(selectedDate, language)}</span>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {t.today}
        </button>
      </div>
      <button
        onClick={() => navigateDay(1)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};