import React, { useState } from 'react';
import { Bell, Languages, LogOut, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { supabase } from '../lib/supabase';
import { useProfileStore } from '../store/profileStore';
import { RequestModal } from './RequestModal';

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showNotifications, 
  setShowNotifications 
}) => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();
  const { profile } = useProfileStore();
  const t = translations[language].home;
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSignOut = async () => {
    try {
      // First clear any stored session data
      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      // Force navigate to login even if there's an error
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {profile?.clinic?.logo_url ? (
            <img 
              src={profile.clinic.logo_url} 
              alt="Clinic Logo"
              className="h-8 w-auto"
            />
          ) : (
            <h1 className="text-2xl font-bold text-indigo-600">Dente.uz</h1>
          )}
          {profile?.clinic && (
            <span className="text-lg font-medium text-gray-900">
              {language === 'uz' ? profile.clinic.name_uz : profile.clinic.name_ru}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{language === 'uz' ? 'So\'rov yuborish' : 'Отправить запрос'}</span>
          </button>
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
          <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      <RequestModal
        showModal={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </header>
  );
};