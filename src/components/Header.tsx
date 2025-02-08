import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, Languages, LogOut, MessageSquare, User } from 'lucide-react';
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
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

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
          <div className="relative" ref={accountMenuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              {profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">{profile?.full_name}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                showAccountMenu ? 'transform rotate-180' : ''
              }`} />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-1 z-20">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-sm text-gray-500">{profile?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setLanguage(language === 'uz' ? 'ru' : 'uz');
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Languages className="w-4 h-4" />
                  <span>{language === 'uz' ? 'Tilni o\'zgartirish' : 'Изменить язык'}</span>
                  <span className="ml-auto uppercase text-xs font-medium text-gray-500">{language}</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{language === 'uz' ? 'Chiqish' : 'Выйти'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RequestModal
        showModal={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </header>
  );
};