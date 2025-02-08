import React from 'react';
import { Check } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

interface PricingFeatureProps {
  onDemoClick: () => void;
}

export const PricingFeature: React.FC<PricingFeatureProps> = ({ onDemoClick }) => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Narxlar",
      description: "Klinikangiz hajmiga mos keladigan rejani tanlang",
      monthly: "oylik",
      tryNow: "Sinab ko'rish",
      contactUs: "Biz bilan bog'laning",
      popular: "Ommabop",
      enterprise: "Korxonalar uchun",
      perDentist: "har bir shifokor uchun",
      contactSales: "Savdo bo'limi bilan bog'laning",
      whiteLabel: "White Label",
      whiteLabel_description: "Katta klinikalar va korxonalar uchun maxsus yechim",
      whiteLabel_features: [
        "Barcha funksiyalar",
        "Maxsus domen",
        "Maxsus Telegram bot",
        "Alohida ma'lumotlar bazasi",
        "SMS xabarnomalar",
        "24/7 qo'llab-quvvatlash"
      ],
      plans: [
        {
          name: "Kichik klinika",
          price: "179,000",
          description: "1-3 nafar shifokor uchun",
          features: [
            "Qabullarni boshqarish tizimi",
            "Bemorlar kartotekasi",
            "Moliyaviy hisobotlar",
            "Telegram bot integratsiyasi",
            "Sodiqlik dasturi",
            "Yo'llash tizimi"
          ]
        },
        {
          name: "O'rta klinika",
          price: "139,000",
          description: "3-5 nafar shifokor uchun",
          features: [
            "Qabullarni boshqarish tizimi",
            "Bemorlar kartotekasi",
            "Moliyaviy hisobotlar",
            "Telegram bot integratsiyasi",
            "Sodiqlik dasturi",
            "Yo'llash tizimi"
          ]
        },
        {
          name: "Katta klinika",
          price: "99,000",
          description: "5 va undan ortiq shifokor uchun",
          features: [
            "Qabullarni boshqarish tizimi",
            "Bemorlar kartotekasi",
            "Moliyaviy hisobotlar",
            "Telegram bot integratsiyasi",
            "Sodiqlik dasturi",
            "Yo'llash tizimi"
          ]
        }
      ]
    },
    ru: {
      title: "Цены",
      description: "Выберите план, соответствующий размеру вашей клиники",
      monthly: "в месяц",
      tryNow: "Попробовать",
      contactUs: "Свяжитесь с нами",
      popular: "Популярный",
      enterprise: "Для предприятий",
      perDentist: "за каждого врача",
      contactSales: "Связаться с отделом продаж",
      whiteLabel: "White Label",
      whiteLabel_description: "Индивидуальное решение для крупных клиник и предприятий",
      whiteLabel_features: [
        "Все функции",
        "Собственный домен",
        "Собственный Telegram бот",
        "Выделенная база данных",
        "SMS уведомления",
        "Поддержка 24/7"
      ],
      plans: [
        {
          name: "Малая клиника",
          price: "179,000",
          description: "Для 1-3 врачей",
          features: [
            "Система управления приёмами",
            "Картотека пациентов",
            "Финансовая отчётность",
            "Интеграция с Telegram",
            "Программа лояльности",
            "Система рефералов"
          ]
        },
        {
          name: "Средняя клиника",
          price: "139,000",
          description: "Для 3-5 врачей",
          features: [
            "Система управления приёмами",
            "Картотека пациентов",
            "Финансовая отчётность",
            "Интеграция с Telegram",
            "Программа лояльности",
            "Система рефералов"
          ]
        },
        {
          name: "Крупная клиника",
          price: "99,000",
          description: "Для 5 и более врачей",
          features: [
            "Система управления приёмами",
            "Картотека пациентов",
            "Финансовая отчётность",
            "Интеграция с Telegram",
            "Программа лояльности",
            "Система рефералов"
          ]
        }
      ]
    }
  };

  const t = translations[language];
  
  const renderPriceCard = (plan: any, index: number) => (
    <div 
      key={index}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-transform hover:scale-105 ${
        index === 1 ? 'md:-mt-4 md:mb-4' : ''
      }`}
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-2xl font-bold text-gray-900">
            {plan.name}
          </h3>
          {index === 1 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {t.popular}
            </span>
          )}
        </div>
        <p className="text-gray-600 mb-6">
          {plan.description}
        </p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-gray-900">
            {plan.price}
          </span>
          <span className="text-gray-600 ml-2">
            UZS / {t.monthly}
          </span>
          <span className="block text-sm text-gray-500 mt-1">
            {t.perDentist}
          </span>
        </div>
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature: string, featureIndex: number) => (
            <li key={featureIndex} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="ml-3 text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onDemoClick}
          className="w-full py-3 px-6 rounded-lg font-medium transition-all relative bg-indigo-600 text-white hover:bg-indigo-700 group"
        >
          <span className="relative z-10">{t.tryNow}</span>
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity rounded-lg"></div>
        </button>
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        <div className="space-y-8">
          {/* Regular plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.plans.map((plan, index) => renderPriceCard(plan, index))}
          </div>
          
          {/* Enterprise plan */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12 bg-opacity-90 bg-white backdrop-blur-sm">
              <div className="md:flex items-start justify-between">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    {t.whiteLabel}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {t.enterprise}
                    </span>
                  </h3>
                  <p className="text-lg text-gray-600 mt-2">
                    {t.whiteLabel_description}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={onDemoClick}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all relative group"
                  >
                    <span className="relative z-10">{t.contactSales}</span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-50 blur-xl transition-opacity rounded-lg"></div>
                  </button>
                </div>
              </div>
              <div className="mt-8 grid md:grid-cols-3 gap-6">
                {t.whiteLabel_features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};