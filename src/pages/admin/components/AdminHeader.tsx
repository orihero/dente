import React from 'react';
import { LogOut, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600">
            Dente.uz Admin
          </h1>
          <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
};