import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLanguageStore } from '../../store/languageStore';
import { patientManagementJson } from '../../assets';

export const PatientManagementFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Bemorlarni boshqarish",
      description: "Barcha bemor ma'lumotlarini tartibli va oson kirish mumkin bo'lgan tarzda saqlaydigan keng qamrovli bemor boshqaruv tizimi. Tibbiy tarix, davolash rejalari va hujjatlarni bir xavfsiz joyda kuzatib boring.",
      bullets: [
        "To'liq tibbiy tarix bilan raqamli bemor yozuvlari",
        "Davolash rejalari va tashriflar tarixini kuzatish",
        "Xavfsiz hujjatlarni boshqarish va ulashish"
      ]
    },
    ru: {
      title: "Управление пациентами",
      description: "Комплексная система управления пациентами, которая хранит всю информацию о пациентах организованно и легкодоступно. Отслеживайте медицинские истории, планы лечения и документы в одном безопасном месте.",
      bullets: [
        "Цифровые карты пациентов с полной медицинской историей",
        "Отслеживание планов лечения и истории посещений",
        "Безопасное управление и обмен документами"
      ]
    }
  };

  const t = translations[language];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <Player
                autoplay
                loop
                src={patientManagementJson}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t.title}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t.description}
            </p>
            <ul className="space-y-4">
              {t.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                  </div>
                  <span className="ml-3 text-gray-600">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};