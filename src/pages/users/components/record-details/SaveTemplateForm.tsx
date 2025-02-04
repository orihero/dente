import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';

interface SaveTemplateFormProps {
  name: string;
  onNameChange: (name: string) => void;
}

export const SaveTemplateForm: React.FC<SaveTemplateFormProps> = ({
  name,
  onNameChange
}) => {
  const { language } = useLanguageStore();

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={language === 'uz' ? 'Shablon nomi' : 'Название шаблона'}
        className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
};