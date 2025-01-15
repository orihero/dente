import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Mail, AlertCircle, Languages, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';

interface LoginForm {
  emailPhone: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // Define translations directly in the component for now
  const translations = {
    uz: {
      title: "Tizimga kirish",
      emailPhone: "Email yoki telefon",
      password: "Parol",
      loginButton: "Kirish",
      forgotPassword: "Parolni unutdingizmi?",
      invalidCredentials: "Email yoki parol noto'g'ri",
      back: "Orqaga"
    },
    ru: {
      title: "Вход в систему",
      emailPhone: "Email или телефон",
      password: "Пароль",
      loginButton: "Войти",
      forgotPassword: "Забыли пароль?",
      invalidCredentials: "Неверный email или пароль",
      back: "Назад"
    }
  };

  const t = translations[language];

  const onSubmit = async (data: LoginForm) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.emailPhone,
        password: data.password,
      });

      if (signInError) throw signInError;

      navigate('/profile');
    } catch (err) {
      setError(t.invalidCredentials);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/50 text-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back}</span>
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'uz' ? 'ru' : 'uz')}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/50"
        >
          <Languages className="w-5 h-5" />
          <span className="uppercase">{language}</span>
        </button>
      </div>
      
      <div className="container mx-auto px-4 h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
            {t.title}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('emailPhone', { required: true })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t.emailPhone}
                />
              </div>
              {errors.emailPhone && (
                <span className="text-sm text-red-500 mt-1">This field is required</span>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('password', { required: true })}
                  type="password"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t.password}
                />
              </div>
              {errors.password && (
                <span className="text-sm text-red-500 mt-1">This field is required</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {t.forgotPassword}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t.loginButton}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};