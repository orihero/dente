import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

export const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].login;

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/50 text-gray-700"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{t.back}</span>
    </button>
  );
};