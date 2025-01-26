import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import { LoginForm } from './login/components/LoginForm';
import { LanguageToggle } from './login/components/LanguageToggle';
import { BackButton } from './login/components/BackButton';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const { checkUser, isAdmin } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const t = translations[language].login;

  const handleSubmit = async (data: { emailPhone: string; password: string }) => {
    setLoading(true);
    setError('');
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.emailPhone,
        password: data.password,
      });

      if (signInError) throw signInError;

      // Update auth state - this will also check admin status
      await checkUser();

      // Get return URL from location state or use default based on isAdmin
      const returnUrl = location.state?.from?.pathname || (isAdmin ? '/admin' : '/dashboard');
      navigate(returnUrl, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>

      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {t.title}
          </h1>

          <LoginForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};