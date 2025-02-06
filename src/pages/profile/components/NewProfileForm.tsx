import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';

interface NewProfileFormProps {
  updateProfile: (data: any) => Promise<void>;
}

export const NewProfileForm: React.FC<NewProfileFormProps> = ({ updateProfile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    experience: '0',
    clinic_id: '',
    type: 'regular'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!data.full_name.trim()) {
        throw new Error(language === 'uz' ? 'Ism kiritilishi shart' : 'Имя обязательно');
      }

      if (!data.phone) {
        throw new Error(language === 'uz' ? 'Telefon raqam kiritilishi shart' : 'Телефон обязателен');
      }

      await updateProfile(data);

      // Navigate based on user type
      if (data.type === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isNewProfile = location.state?.isNewProfile;
  const message = location.state?.message;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">
          {language === 'uz'
            ? 'Profilingizni to\'ldiring'
            : 'Заполните свой профиль'}
        </h1>

        {isNewProfile && message && (
          <p className="text-center text-gray-600 mb-6">{message}</p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.fullName}
            </label>
            <input
              type="text"
              required
              value={data.full_name}
              onChange={(e) => setData({ ...data, full_name: e.target.value })}
              placeholder={language === 'uz' ? 'To\'liq ismingizni kiriting' : 'Введите ваше полное имя'}
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
              {t.experience}
            </label>
            <input
              type="number"
              min="0"
              value={data.experience}
              onChange={(e) => setData({ ...data, experience: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !data.full_name.trim() || !data.phone}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...'}</span>
              </>
            ) : (
              <span>{language === 'uz' ? 'Saqlash' : 'Сохранить'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};