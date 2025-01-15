import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { PhoneInput } from '../PhoneInput';

interface DemoBookingModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  showModal,
  onClose
}) => {
  const { language } = useLanguageStore();
  const [data, setData] = useState({
    name: '',
    phone: '',
    preferredDate: '',
    preferredTime: ''
  });

  const translations = {
    uz: {
      title: "Demo uchun yoziling",
      name: "Ismingiz",
      phone: "Telefon raqamingiz",
      date: "Qo'ng'iroq qilish sanasi",
      time: "Qo'ng'iroq qilish vaqti",
      submit: "Yuborish",
      cancel: "Bekor qilish"
    },
    ru: {
      title: "Записаться на демо",
      name: "Ваше имя",
      phone: "Ваш номер телефона",
      date: "Дата звонка",
      time: "Время звонка",
      submit: "Отправить",
      cancel: "Отмена"
    },
    en: {
      title: "Book a Demo",
      name: "Your Name",
      phone: "Your Phone Number",
      date: "Preferred Call Date",
      time: "Preferred Call Time",
      submit: "Submit",
      cancel: "Cancel"
    }
  };

  const t = translations[language];

  if (!showModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Demo booking data:', data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.name}
            </label>
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.phone}
            </label>
            <PhoneInput
              value={data.phone}
              onChange={(value) => setData({ ...data, phone: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.date}
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={data.preferredDate}
              onChange={(e) => setData({ ...data, preferredDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.time}
            </label>
            <input
              type="time"
              required
              value={data.preferredTime}
              onChange={(e) => setData({ ...data, preferredTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};