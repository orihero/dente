import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLanguageStore } from '../../store/languageStore';
import { loyaltyJson } from '../../assets';

export const LoyaltyFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Bemor sodiqlik dasturi",
      description: "Bizning keng qamrovli sodiqlik dasturimiz orqali bemorlar bilan uzoq muddatli munosabatlarni o'rnating. Muntazam tashriflarni taqdirlang, davolanishni yakunlashni rag'batlantiring va bemorlarni saqlab qolishni oshiring.",
      bullets: [
        "Ballarga asoslangan mukofot tizimi",
        "O'ziga xos imtiyozlarga ega ko'p darajali a'zolik",
        "Avtomatlashtirilgan mukofotlarni taqsimlash va kuzatish"
      ]
    },
    ru: {
      title: "Программа лояльности пациентов",
      description: "Выстраивайте долгосрочные отношения с пациентами через нашу комплексную программу лояльности. Поощряйте регулярные посещения, стимулируйте завершение лечения и повышайте удержание пациентов.",
      bullets: [
        "Балльная система вознаграждений",
        "Многоуровневое членство с уникальными привилегиями",
        "Автоматизированное распределение и отслеживание наград"
      ]
    }
  };

  const t = translations[language];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
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
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="w-full max-w-md">
              <Player
                autoplay
                loop
                src={loyaltyJson}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};