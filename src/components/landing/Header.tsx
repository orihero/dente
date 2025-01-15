import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

interface HeaderProps {
  onDemoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDemoClick }) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();

  const translations = {
    uz: {
      bookDemo: "Demo uchun yoziling",
      login: "Kirish"
    },
    ru: {
      bookDemo: "Записаться на демо",
      login: "Войти"
    }
  };

  const t = translations[language];

  const handleLanguageChange = () => {
    setLanguage(language === 'uz' ? 'ru' : 'uz');
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <h1 className="text-2xl font-bold text-indigo-600">Dente.uz</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLanguageChange}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/50"
            >
              <Languages className="w-5 h-5" />
              <span className="uppercase">{language}</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-md"
            >
              {t.login}
            </button>
            <button
              onClick={onDemoClick}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
            >
              {t.bookDemo}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};