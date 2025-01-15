import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export const FAQFeature = () => {
  const { language } = useLanguageStore();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const translations = {
    uz: {
      title: "Ko'p so'raladigan savollar",
      description: "Dente.uz haqida eng ko'p so'raladigan savollarga javoblar",
      faqs: [
        {
          question: "Dente.uz nima va u stomatologiya klinikalariga qanday yordam beradi?",
          answer: "Dente.uz - bu stomatologiya kliniklarini boshqarish uchun maxsus ishlab chiqilgan platforma. U bemorlar bilan ishlash, qabullarni rejalashtirish, moliyaviy operatsiyalarni kuzatish va klinika faoliyatini samarali boshqarishga yordam beradi."
        },
        {
          question: "Dente.uz'dan kimlar foydalanishi mumkin?",
          answer: "Dente.uz barcha stomatologiya kliniklariga mo'ljallangan - kichik xususiy amaliyotlardan tortib yirik tibbiyot markazlarigacha. Platforma turli o'lchamdagi klinikalar ehtiyojlariga moslashtirilgan."
        },
        {
          question: "Basic, Pro va Custom tariflar o'rtasida qanday farq bor?",
          answer: "Basic tarifi asosiy funksiyalarni o'z ichiga oladi, Pro tarifi qo'shimcha xususiyatlar va Telegram integratsiyasini taqdim etadi, Custom tarifi esa to'liq moslashtirilgan yechimlarni taklif qiladi."
        },
        {
          question: "Dente.uz'da qanday boshlash mumkin?",
          answer: "Boshlash uchun demo versiyasini ko'rish uchun ro'yxatdan o'ting yoki bizning mutaxassislarimiz bilan konsultatsiya uchun qo'ng'iroq belgilang. Biz sizga eng mos tarifni tanlashga yordam beramiz."
        },
        {
          question: "Yordam kerak bo'lsa nima qilaman?",
          answer: "Bizning qo'llab-quvvatlash xizmatimiz 24/7 rejimida ishlaydi. Telegram orqali yoki telefon orqali bog'lanishingiz mumkin."
        }
      ]
    },
    ru: {
      title: "Часто задаваемые вопросы",
      description: "Ответы на самые популярные вопросы о Dente.uz",
      faqs: [
        {
          question: "Что такое Dente.uz и как она помогает стоматологическим клиникам?",
          answer: "Dente.uz - это специализированная платформа для управления стоматологическими клиниками. Она помогает эффективно управлять работой с пациентами, планировать приёмы, отслеживать финансовые операции и оптимизировать работу клиники."
        },
        {
          question: "Кто может использовать Dente.uz?",
          answer: "Dente.uz предназначен для всех стоматологических клиник - от небольших частных практик до крупных медицинских центров. Платформа адаптирована под потребности клиник разного размера."
        },
        {
          question: "В чём разница между тарифами Basic, Pro и Custom?",
          answer: "Тариф Basic включает базовые функции, Pro предоставляет дополнительные возможности и интеграцию с Telegram, а Custom предлагает полностью индивидуальные решения."
        },
        {
          question: "Как начать работу с Dente.uz?",
          answer: "Чтобы начать, зарегистрируйтесь для просмотра демо-версии или запишитесь на консультацию с нашими специалистами. Мы поможем выбрать оптимальный тариф."
        },
        {
          question: "Что делать, если мне нужна поддержка?",
          answer: "Наша служба поддержки работает 24/7. Вы можете связаться с нами через Telegram или по телефону."
        }
      ]
    }
  };

  const t = translations[language];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

        <div className="max-w-3xl mx-auto divide-y divide-gray-200">
          {t.faqs.map((faq, index) => (
            <div key={index} className="py-6">
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-start justify-between text-left"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-8">
                  {faq.question}
                </h3>
                <span className="ml-6 flex-shrink-0">
                  <ChevronDown
                    className={`w-6 h-6 text-indigo-600 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>
              <div
                className={`mt-2 overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};