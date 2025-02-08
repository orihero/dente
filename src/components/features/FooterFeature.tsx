import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Send, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';
import { PhoneInput } from '../PhoneInput';
import { TermsOfUseModal } from '../landing/TermsOfUseModal';
import { PrivacyPolicyModal } from '../landing/PrivacyPolicyModal';
import { supabase } from '../../lib/supabase';

export const FooterFeature: React.FC = () => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    full_name: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: data.full_name,
          phone: data.phone
        });

      if (leadError) throw leadError;

      setSuccess(true);
      setData({
        full_name: '',
        phone: ''
      });

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      setError(language === 'uz' 
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  const t = {
    uz: {
      about: {
        title: "Biz haqimizda",
        description: "Dente.uz - stomatologiya klinikalari uchun zamonaviy boshqaruv tizimi. Bizning maqsadimiz stomatologiya klinikalarining ish samaradorligini oshirish va bemorlar bilan munosabatlarni yaxshilashdir."
      },
      quickLinks: {
        title: "Tezkor havolalar",
        links: [
          { name: "Asosiy", href: "#" },
          { name: "Xizmatlar", href: "#" },
          { name: "Narxlar", href: "#" },
          { name: "FAQ", href: "#" },
          { name: "Bog'lanish", href: "#" }
        ]
      },
      contact: {
        title: "Bog'lanish",
        email: "Email",
        phone: "Telefon",
        address: "Manzil"
      },
      legal: {
        privacy: "Maxfiylik siyosati",
        terms: "Foydalanish shartlari",
        rights: "Barcha huquqlar himoyalangan"
      },
      bookCall: {
        title: "Qo'ng'iroq buyurtma qilish",
        description: "Bizning mutaxassislarimiz siz bilan bog'lanishadi",
        fullName: "To'liq ismingiz",
        phone: "Telefon raqamingiz",
        submit: "Yuborish",
        submitting: "Yuborilmoqda...",
        success: "So'rovingiz qabul qilindi!"
      }
    },
    ru: {
      about: {
        title: "О нас",
        description: "Dente.uz - современная система управления для стоматологических клиник. Наша цель - повысить эффективность работы стоматологических клиник и улучшить взаимодействие с пациентами."
      },
      quickLinks: {
        title: "Быстрые ссылки",
        links: [
          { name: "Главная", href: "#" },
          { name: "Услуги", href: "#" },
          { name: "Цены", href: "#" },
          { name: "FAQ", href: "#" },
          { name: "Контакты", href: "#" }
        ]
      },
      contact: {
        title: "Контакты",
        email: "Email",
        phone: "Телефон",
        address: "Адрес"
      },
      legal: {
        privacy: "Политика конфиденциальности",
        terms: "Условия использования",
        rights: "Все права защищены"
      },
      bookCall: {
        title: "Заказать звонок",
        description: "Наши специалисты свяжутся с вами",
        fullName: "Ваше полное имя",
        phone: "Ваш номер телефона",
        submit: "Отправить",
        submitting: "Отправка...",
        success: "Ваша заявка принята!"
      }
    }
  };

  const currentTranslation = t[language];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {currentTranslation.about.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {currentTranslation.about.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {currentTranslation.quickLinks.title}
            </h3>
            <ul className="space-y-2">
              {currentTranslation.quickLinks.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {currentTranslation.contact.title}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-indigo-400" />
                <a
                  href="mailto:support@dente.uz"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  support@dente.uz
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-indigo-400" />
                <a
                  href="tel:+998950620500"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +998 95 062 05 00
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-indigo-400 mt-1" />
                <span className="text-gray-400">
                  Samarqand, Mirzo Ulug'bek ko'chasi 140, O'zbekiston
                </span>
              </li>
            </ul>
          </div>

          {/* Book Call Form */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {currentTranslation.bookCall.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {currentTranslation.bookCall.description}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-md flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success ? (
              <div className="p-3 bg-green-900/50 text-green-200 rounded-md">
                <p>{currentTranslation.bookCall.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={data.full_name}
                    onChange={(e) => setData({ ...data, full_name: e.target.value })}
                    placeholder={currentTranslation.bookCall.fullName}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <PhoneInput
                    value={data.phone}
                    onChange={(value) => setData({ ...data, phone: value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
                >
                  {loading ? currentTranslation.bookCall.submitting : currentTranslation.bookCall.submit}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Dente.uz. {currentTranslation.legal.rights}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                onClick={() => setShowPrivacyPolicy(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
                role="button"
              >
                {currentTranslation.legal.privacy}
              </a>
              <a
                onClick={() => setShowTermsOfUse(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
                role="button"
              >
                {currentTranslation.legal.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
      <PrivacyPolicyModal
        showModal={showPrivacyPolicy}
        onClose={() => setShowPrivacyPolicy(false)}
      />
      <TermsOfUseModal
        showModal={showTermsOfUse}
        onClose={() => setShowTermsOfUse(false)}
      />
    </footer>
  );
};