import React from 'react';
import { Check } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export const PricingFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Narxlar",
      description: "Klinikangiz ehtiyojlariga mos keladigan rejani tanlang",
      monthly: "oylik",
      getStarted: "Boshlash",
      contactUs: "Biz bilan bog'laning",
      popular: "Eng mashhur",
      plans: [
        {
          name: "Basic",
          price: "99,000",
          description: "Kichik klinikalar uchun asosiy xizmatlar",
          features: [
            "Qabullarni boshqarish",
            "Asosiy bemor yozuvlarini yuritish",
            "To'lovlar va qarzlarni kuzatish uchun moliyaviy vositalar"
          ]
        },
        {
          name: "Pro",
          price: "199,000",
          description: "O'rta va katta klinikalar uchun kengaytirilgan xizmatlar",
          features: [
            "Qabullarni boshqarish",
            "Kengaytirilgan bemor yozuvlarini yuritish",
            "Telegram orqali avtomatik eslatmalar",
            "To'lovlar va qarzlarni kuzatish uchun moliyaviy vositalar",
            "Maxsus kunlar uchun chegirmalar bilan sodiqlik dasturi",
            "Klinikangizni tavsiya qilish uchun yo'llash dasturi"
          ]
        },
        {
          name: "Custom",
          description: "Katta klinikalar uchun maxsus yechimlar",
          features: [
            "Pro rejadagi barcha xizmatlar",
            "Katta klinikalar uchun maxsus sozlamalar",
            "Maxsus brending va qo'shimcha xizmatlar",
            "Mijoz talablariga ko'ra qo'shimcha funksiyalar"
          ]
        }
      ]
    },
    ru: {
      title: "Цены",
      description: "Выберите план, который подходит потребностям вашей клиники",
      monthly: "в месяц",
      getStarted: "Начать",
      contactUs: "Свяжитесь с нами",
      popular: "Популярный",
      plans: [
        {
          name: "Basic",
          price: "99,000",
          description: "Базовые услуги для небольших клиник",
          features: [
            "Управление приёмами",
            "Базовое ведение карт пациентов",
            "Финансовые инструменты для отслеживания платежей и задолженностей"
          ]
        },
        {
          name: "Pro",
          price: "199,000",
          description: "Расширенные услуги для средних и крупных клиник",
          features: [
            "Управление приёмами",
            "Расширенное ведение карт пациентов",
            "Автоматические напоминания через Telegram",
            "Финансовые инструменты для отслеживания платежей и задолженностей",
            "Программа лояльности со скидками на особые даты",
            "Реферальная программа для рекомендаций вашей клиники"
          ]
        },
        {
          name: "Custom",
          description: "Индивидуальные решения для крупных клиник",
          features: [
            "Все услуги тарифа Pro",
            "Специальные настройки для крупных клиник",
            "Индивидуальный брендинг и дополнительные услуги",
            "Дополнительные функции по требованию клиента"
          ]
        }
      ]
    }
  };

  const t = translations[language];

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.plans.map((plan, index) => (
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
                {plan.price ? (
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">
                      UZS / {t.monthly}
                    </span>
                  </div>
                ) : (
                  <div className="h-[60px]" /> // Spacer for Custom plan
                )}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 px-6 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {plan.price ? t.getStarted : t.contactUs}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};