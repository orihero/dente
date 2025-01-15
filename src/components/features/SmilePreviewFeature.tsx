import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import { useLanguageStore } from '../../store/languageStore';
import { smilePreviewJson } from '../../assets';

export const SmilePreviewFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Tabassum oldindan ko'rish texnologiyasi",
      description: "Bizning ilg'or vizualizatsiya texnologiyamiz yordamida bemorlarga kelajakdagi tabassumlarini ko'rsating. Bemorlarga davolash natijalarini tushunishga yordam bering va davolash holatlarini qabul qilish darajasini oshiring.",
      comingSoon: "Tez kunda",
      bullets: [
        "Real vaqt rejimida tabassum simulyatsiyasi",
        "Davolashdan oldingi va keyingi taqqoslash",
        "Oldindan ko'rish natijalarini oson ulashish"
      ]
    },
    ru: {
      title: "Технология предварительного просмотра улыбки",
      description: "Покажите пациентам их будущую улыбку с помощью нашей передовой технологии визуализации. Помогите пациентам понять результаты лечения и повысьте уровень принятия случаев.",
      comingSoon: "Скоро",
      bullets: [
        "Симуляция улыбки в реальном времени",
        "Сравнение до и после лечения",
        "Простой обмен результатами предпросмотра"
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
                src={smilePreviewJson}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {t.title}
              </h2>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {t.comingSoon}
              </span>
            </div>
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