import React from 'react';
import { Users, User, Home as HomeIcon, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const t = translations[language].navigation;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around py-2">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">{t.appointments}</span>
          </button>
          <button
            onClick={() => navigate('/users')}
            className={`flex flex-col items-center p-2 ${
              location.pathname.startsWith('/users') ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">{t.patients}</span>
          </button>
          <button
            onClick={() => navigate('/draft')}
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/draft' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs mt-1">{t.draft}</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center p-2 ${
              location.pathname === '/profile' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">{t.profile}</span>
          </button>
        </div>
      </div>
    </div>
  );
};