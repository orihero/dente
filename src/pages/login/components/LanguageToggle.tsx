import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <button
      onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/50"
    >
      <Languages className="w-5 h-5" />
      <span className="uppercase">{language}</span>
    </button>
  );
};