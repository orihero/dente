import React from 'react';
import { Clock } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface WorkingHoursProps {
  workingHours: Record<string, { open: string; close: string } | null>;
  onChange: (hours: Record<string, { open: string; close: string } | null>) => void;
}

export const WorkingHours: React.FC<WorkingHoursProps> = ({
  workingHours,
  onChange
}) => {
  const { language } = useLanguageStore();

  const weekDays = {
    monday: language === 'uz' ? 'Dushanba' : 'Понедельник',
    tuesday: language === 'uz' ? 'Seshanba' : 'Вторник',
    wednesday: language === 'uz' ? 'Chorshanba' : 'Среда',
    thursday: language === 'uz' ? 'Payshanba' : 'Четверг',
    friday: language === 'uz' ? 'Juma' : 'Пятница',
    saturday: language === 'uz' ? 'Shanba' : 'Суббота',
    sunday: language === 'uz' ? 'Yakshanba' : 'Воскресенье'
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        {language === 'uz' ? 'Ish vaqti' : 'Рабочее время'}
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {Object.entries(weekDays).map(([day, label]) => (
          <div key={day} className="flex items-center gap-4">
            <div className="w-32 font-medium">{label}</div>
            {workingHours[day] ? (
              <div className="flex items-center gap-4">
                <input
                  type="time"
                  value={workingHours[day]?.open}
                  onChange={(e) => onChange({
                    ...workingHours,
                    [day]: { ...workingHours[day]!, open: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span>-</span>
                <input
                  type="time"
                  value={workingHours[day]?.close}
                  onChange={(e) => onChange({
                    ...workingHours,
                    [day]: { ...workingHours[day]!, close: e.target.value }
                  })}
                  className="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => onChange({
                    ...workingHours,
                    [day]: null
                  })}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  {language === 'uz' ? 'Dam olish' : 'Выходной'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange({
                  ...workingHours,
                  [day]: { open: '09:00', close: '18:00' }
                })}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {language === 'uz' ? 'Ish kuni qo\'shish' : 'Добавить рабочий день'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};