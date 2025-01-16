import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';
import { PhoneInput } from '../PhoneInput';
import { supabase } from '../../lib/supabase';

interface DemoBookingModalProps {
  showModal: boolean;
  onClose: () => void;
  referredBy?: string;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  showModal,
  onClose,
  referredBy
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].landing;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    email: '',
    preferred_date: '',
    preferred_time: ''
  });

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          referred_by: referredBy || null
        });

      if (leadError) throw leadError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setData({
          full_name: '',
          phone: '',
          email: '',
          preferred_date: '',
          preferred_time: ''
        });
      }, 2000);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.bookDemo}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'uz' 
                ? 'So\'rovingiz qabul qilindi!'
                : 'Ваша заявка принята!'}
            </h3>
            <p className="text-gray-600">
              {language === 'uz'
                ? 'Tez orada siz bilan bog\'lanamiz'
                : 'Мы свяжемся с вами в ближайшее время'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={data.full_name}
                onChange={(e) => setData({ ...data, full_name: e.target.value })}
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
                Email
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.preferredDate}
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={data.preferred_date}
                onChange={(e) => setData({ ...data, preferred_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.preferredTime}
              </label>
              <input
                type="time"
                required
                value={data.preferred_time}
                onChange={(e) => setData({ ...data, preferred_time: e.target.value })}
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
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};