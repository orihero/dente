import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';

interface ViewSwitchProps {
  view: 'daily' | 'weekly';
  onViewChange: (view: 'daily' | 'weekly') => void;
}

export const ViewSwitch: React.FC<ViewSwitchProps> = ({
  view,
  onViewChange
}) => {
  const { language } = useLanguageStore();

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex rounded-lg border border-gray-200 p-1">
        <button
          onClick={() => onViewChange('daily')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md ${
            view === 'daily'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {language === 'uz' ? 'Kunlik' : 'День'}
        </button>
        <button
          onClick={() => onViewChange('weekly')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md ${
            view === 'weekly'
              ? 'bg-indigo-600 text-white'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {language === 'uz' ? 'Haftalik' : 'Неделя'}
        </button>
      </div>
    </div>
  );
};