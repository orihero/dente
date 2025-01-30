import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';
import { DatePicker } from '../../../components/DatePicker';

interface NewUserModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const NewUserModal: React.FC<NewUserModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    birthdate: '',
    address: ''
  });

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!data.full_name.trim()) {
        throw new Error(language === 'uz' ? 'Ism kiritilishi shart' : 'Имя обязательно');
      }

      if (!data.phone) {
        throw new Error(language === 'uz' ? 'Telefon raqam kiritilishi shart' : 'Телефон обязателен');
      }

      if (!data.birthdate) {
        throw new Error(language === 'uz' ? 'Tug\'ilgan sana kiritilishi shart' : 'Дата рождения обязательна');
      }

      await onSubmit(data);
      setData({
        full_name: '',
        phone: '',
        birthdate: '',
        address: ''
      });
    } catch (error: any) {
      console.error('Error creating patient:', error);
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.addUser}</h2>
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
              placeholder={language === 'uz' ? 'To\'liq ismni kiriting' : 'Введите полное имя'}
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
              {t.birthdate}
            </label>
            <DatePicker
              value={data.birthdate}
              onChange={(value) => setData({ ...data, birthdate: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Manzil' : 'Адрес'}
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder={language === 'uz' ? 'Manzilni kiriting' : 'Введите адрес'}
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
              disabled={loading || !data.full_name || !data.phone || !data.birthdate}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};