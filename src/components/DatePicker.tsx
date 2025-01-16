import React, { useEffect } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, className = '' }) => {
  const { language } = useLanguageStore();
  const t = translations[language].common;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  // Parse current value
  const [selectedDate, setSelectedDate] = React.useState(() => {
    if (!value) return { day: '', month: '', year: '' };
    const [year, month, day] = value.split('-');
    return { day, month, year };
  });

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      setSelectedDate({ day, month, year });
    } else {
      setSelectedDate({ day: '', month: '', year: '' });
    }
  }, [value]);

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

      let day = parseInt(newDate.day);
      if (isNaN(day) || day < 1) day = 1;
      if (day > daysInMonth) day = daysInMonth;

      onChange(`${newDate.year}-${newDate.month}-${day.toString().padStart(2, '0')}`);
    }
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 2 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    handleChange('day', value);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={selectedDate.day}
        onChange={handleDayChange}
        placeholder={t.day}
        className="w-16 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      />
      <select
        value={selectedDate.month}
        onChange={(e) => handleChange('month', e.target.value)}
        className="w-32 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{t.month}</option>
        {[...Array(12)].map((_, i) => {
          const monthNum = i + 1;
          return (
            <option key={monthNum} value={monthNum.toString().padStart(2, '0')}>
              {t.months[monthNum as keyof typeof t.months]}
            </option>
          );
        })}
      </select>
      <select
        value={selectedDate.year}
        onChange={(e) => handleChange('year', e.target.value)}
        className="flex-1 px-2 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">{t.year}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};