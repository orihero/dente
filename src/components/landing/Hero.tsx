import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../store/languageStore';

interface HeroProps {
  onDemoClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onDemoClick }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      bookDemo: "Demo uchun yoziling",
      login: "Kirish",
      tagline: "Stomatologiya klinikasi uchun zamonaviy boshqaruv tizimi",
      subtitle: "Bemorlaringizni professional darajada boshqaring",
      description: "Dente.uz - bu stomatologlar uchun maxsus ishlab chiqilgan platforma bo'lib, bemorlar va qabullarni samarali boshqarish imkonini beradi. Bizning tizim orqali siz o'z amaliyotingizni yanada samarali va professional darajada olib borishingiz mumkin."
    },
    ru: {
      bookDemo: "Записаться на демо",
      login: "Войти",
      tagline: "Современная система управления для стоматологической клиники",
      subtitle: "Управляйте пациентами на профессиональном уровне",
      description: "Dente.uz - это специально разработанная платформа для стоматологов, которая позволяет эффективно управлять пациентами и приёмами. С нашей системой вы сможете вести свою практику ещё более эффективно и профессионально."
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              {t.tagline}
            </h2>
            <p className="text-2xl text-indigo-600 font-medium mb-6">
              {t.subtitle}
            </p>
            <p className="text-lg text-gray-600 mb-8">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onDemoClick}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
              >
                {t.bookDemo}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-600 text-lg font-medium rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                {t.login}
              </button>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80"
              alt="Dentist with patient"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};