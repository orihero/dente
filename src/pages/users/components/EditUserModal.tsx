import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';

interface User {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
}

interface EditUserModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  user: User;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  user
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    birthdate: ''
  });

  useEffect(() => {
    if (user) {
      setData({
        full_name: user.full_name,
        phone: user.phone,
        birthdate: user.birthdate
      });
    }
  }, [user]);

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(data);
  };

  const isFormValid = data.full_name && data.phone && data.birthdate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.editUser}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
              {t.birthdate}
            </label>
            <input
              type="date"
              required
              value={data.birthdate}
              onChange={(e) => setData({ ...data, birthdate: e.target.value })}
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
              disabled={loading || !isFormValid}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};