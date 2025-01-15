import React from 'react';
import { PhoneCall, Settings, Key } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export const ProcessFeature = () => {
  const { language } = useLanguageStore();

  const translations = {
    uz: {
      title: "Boshlash jarayoni",
      description: "Bizning platformamizga qo'shilish uchun uchta oddiy qadam:",
      steps: [
        {
          title: "Agentimiz bilan qo'ng'iroq rejalashtiring",
          description: "Klinikangiz ehtiyojlarini muhokama qilish uchun maslahat belgilang",
          icon: PhoneCall
        },
        {
          title: "Hisob sozlamalari",
          description: "Mutaxassislar hisobingizni sozlaydi va platformani afzalliklaringizga moslashtiradi",
          icon: Settings
        },
        {
          title: "Kirish ma'lumotlarini oling",
          description: "Hisobingizga kirish va klinikangizni boshqarishni boshlash",
          icon: Key
        }
      ]
    },
    ru: {
      title: "Процесс подключения",
      description: "Три простых шага для подключения к нашей платформе:",
      steps: [
        {
          title: "Запланируйте звонок с нашим агентом",
          description: "Назначьте консультацию для обсуждения потребностей вашей клиники",
          icon: PhoneCall
        },
        {
          title: "Настройка аккаунта",
          description: "Эксперты настроят ваш аккаунт и адаптируют платформу под ваши предпочтения",
          icon: Settings
        },
        {
          title: "Получите учетные данные",
          description: "Получите доступ к вашему аккаунту и начните управлять клиникой",
          icon: Key
        }
      ]
    }
  };

  const t = translations[language];

  return (
    <section className="py-20 bg-white">
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
          {t.steps.map((step, index) => (
            <div 
              key={index}
              className="relative bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:border-indigo-200 transition-colors"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                  {index + 1}
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-center mb-6">
                  <step.icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};