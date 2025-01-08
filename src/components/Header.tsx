import React from 'react';
import { Bell, Languages } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ showNotifications, setShowNotifications }) => {
  const { language, setLanguage } = useLanguageStore();
  const t = translations[language].home;

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-indigo-600">Dente.uz</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-10">
                <div className="px-4 py-2 text-sm text-gray-500">
                  {t.noNotifications}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Languages className="w-5 h-5" />
            <span className="uppercase">{language}</span>
          </button>
        </div>
      </div>
    </header>
  );
};