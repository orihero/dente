import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLanguageStore } from '../../store/languageStore';
import { referalJson } from '../../assets';

export const ReferralFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Bemor yo'llash tizimi",
      description: "Bizning aqlli yo'llash boshqaruv tizimimiz bilan amaliyotingizni rivojlantiring. Yo'llanmalarni kuzating, sodiq bemorlarni taqdirlang va yo'llash dasturingiz muvaffaqiyatini nazorat qiling.",
      bullets: [
        "Avtomatlashtirilgan yo'llash kuzatuvi va boshqaruvi",
        "Yo'llovchilar uchun moslashtirilgan mukofot dasturlari",
        "Batafsil yo'llash tahlili va tushunchalar"
      ]
    },
    ru: {
      title: "Система направлений пациентов",
      description: "Развивайте свою практику с нашей интеллектуальной системой управления направлениями. Отслеживайте направления, вознаграждайте лояльных пациентов и контролируйте успех вашей программы направлений.",
      bullets: [
        "Автоматизированное отслеживание и управление направлениями",
        "Настраиваемые программы вознаграждений для направляющих",
        "Детальная аналитика и статистика направлений"
      ]
    }
  };

  const t = translations[language];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="w-full max-w-2xl transform scale-125">
              <Player
                autoplay
                loop
                src={referalJson}
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