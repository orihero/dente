import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { adminSupabase } from '../../../lib/adminSupabase';

interface NewDentistModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  clinics: any[];
}

export const NewDentistModal: React.FC<NewDentistModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  clinics
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    experience: '0',
    type: 'regular',
    clinic_id: ''
  });

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Create auth user with admin client
      const { data: authData, error: authError } = await adminSupabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      // Update dentist profile
      const { error: profileError } = await adminSupabase
        .from('dentists')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          experience: parseInt(data.experience),
          type: data.type,
          clinic_id: data.clinic_id || null
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      await onSubmit();
      onClose();
      
      // Reset form
      setData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        experience: '0',
        type: 'regular',
        clinic_id: ''
      });
    } catch (error: any) {
      console.error('Error creating dentist:', error);
      setError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {language === 'uz' ? 'Shifokor qo\'shish' : 'Добавить врача'}
          </h2>
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
              {language === 'uz' ? 'Email' : 'Email'}
            </label>
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Parol' : 'Пароль'}
            </label>
            <input
              type="password"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'To\'liq ism' : 'Полное имя'}
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
              {language === 'uz' ? 'Telefon' : 'Телефон'}
            </label>
            <input
              type="tel"
              required
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Tajriba (yil)' : 'Опыт (лет)'}
            </label>
            <input
              type="number"
              required
              min="0"
              value={data.experience}
              onChange={(e) => setData({ ...data, experience: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Klinika' : 'Клиника'}
            </label>
            <select
              value={data.clinic_id}
              onChange={(e) => setData({ ...data, clinic_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">
                {language === 'uz' ? 'Klinikani tanlang' : 'Выберите клинику'}
              </option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {language === 'uz' ? clinic.name_uz : clinic.name_ru}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Turi' : 'Тип'}
            </label>
            <select
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="regular">
                {language === 'uz' ? 'Oddiy' : 'Обычный'}
              </option>
              <option value="admin">
                {language === 'uz' ? 'Admin' : 'Админ'}
              </option>
            </select>
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
              {loading 
                ? (language === 'uz' ? 'Yaratilmoqda...' : 'Создание...') 
                : (language === 'uz' ? 'Yaratish' : 'Создать')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};