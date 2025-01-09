import React from 'react';
import { useLanguageStore } from '../store/languageStore';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className = '' }) => {
  const { language } = useLanguageStore();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  // Bilingual month names
  const months = [
    { value: '01', uz: 'Yanvar', ru: 'Январь' },
    { value: '02', uz: 'Fevral', ru: 'Февраль' },
    { value: '03', uz: 'Mart', ru: 'Март' },
    { value: '04', uz: 'Aprel', ru: 'Апрель' },
    { value: '05', uz: 'May', ru: 'Май' },
    { value: '06', uz: 'Iyun', ru: 'Июнь' },
    { value: '07', uz: 'Iyul', ru: 'Июль' },
    { value: '08', uz: 'Avgust', ru: 'Август' },
    { value: '09', uz: 'Sentabr', ru: 'Сентябрь' },
    { value: '10', uz: 'Oktabr', ru: 'Октябрь' },
    { value: '11', uz: 'Noyabr', ru: 'Ноябрь' },
    { value: '12', uz: 'Dekabr', ru: 'Декабрь' }
  ];

  const [selectedDate, setSelectedDate] = React.useState(() => {
    if (!value) return { day: '', month: '', year: '' };
    const [year, month, day] = value.split('-');
    return { day, month, year };
  });

  const handleChange = (field: 'day' | 'month' | 'year', value: string) => {
    const newDate = { ...selectedDate, [field]: value };
    setSelectedDate(newDate);

    if (newDate.day && newDate.month && newDate.year) {
      // Validate day based on month and year
      const daysInMonth = new Date(
        parseInt(newDate.year),
        parseInt(newDate.month),
        0
      ).getDate();

      if (parseInt(newDate.day) > daysInMonth) {
        newDate.day = daysInMonth.toString().padStart(2, '0');
      }

      onChange(`${newDate.year}-${newDate.month}-${newDate.day}`);
    }
  };

  const validateDay = (value: string) => {
    const day = parseInt(value);
    if (isNaN(day) || day < 1) return '01';
    if (day > 31) return '31';
    return day.toString().padStart(2, '0');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={selectedDate.day}
        onChange={(e) => handleChange('day', validateDay(e.target.value))}
        placeholder={language === 'uz' ? 'Kun' : 'День'}
        className="w-16 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        maxLength={2}
      />
      <select
        value={selectedDate.month}
        onChange={(e) => handleChange('month', e.target.value)}
        className="flex-1 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{language === 'uz' ? 'Oy' : 'Месяц'}</option>
        {months.map((month) => (
          <option key={month.value} value={month.value}>
            {language === 'uz' ? month.uz : month.ru}
          </option>
        ))}
      </select>
      <select
        value={selectedDate.year}
        onChange={(e) => handleChange('year', e.target.value)}
        className="w-24 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{language === 'uz' ? 'Yil' : 'Год'}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};