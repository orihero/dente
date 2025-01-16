import React from 'react';
import { Plus } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface SelectedTooth {
  id: string;
  name: string;
}

interface SelectedTeethBarProps {
  selectedTeeth: SelectedTooth[];
  onApplyServices: () => void;
}

export const SelectedTeethBar: React.FC<SelectedTeethBarProps> = ({
  selectedTeeth,
  onApplyServices
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].draft;

  if (selectedTeeth.length === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white border-t shadow-lg p-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">{t.selectedTeeth}:</span>
            <div className="flex flex-wrap gap-2">
              {selectedTeeth.map((tooth) => (
                <span
                  key={tooth.id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tooth.id}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onApplyServices}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>{t.applyServices}</span>
          </button>
        </div>
      </div>
    </div>
  );
};