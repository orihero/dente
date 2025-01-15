import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Send } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';

export const FooterFeature: React.FC = () => {
  const { language } = useLanguageStore();

  const translations = {
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
      }
    }
  };

  const t = translations[language];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {t.about.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {t.about.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {t.quickLinks.title}
            </h3>
            <ul className="space-y-2">
              {t.quickLinks.links.map((link, index) => (
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
              {t.contact.title}
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
                  href="tel:+998901234567"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +998 90 123 45 67
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-indigo-400 mt-1" />
                <span className="text-gray-400">
                  Tashkent, Uzbekistan
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Social Media
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <Send className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Dente.uz. {t.legal.rights}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t.legal.privacy}
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t.legal.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};