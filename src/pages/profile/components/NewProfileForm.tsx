import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface NewProfileFormProps {
  updateProfile: (data: any) => Promise<void>;
}

export const NewProfileForm: React.FC<NewProfileFormProps> = ({ updateProfile }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].profile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      full_name: (form.full_name as HTMLInputElement).value,
      phone: (form.phone as HTMLInputElement).value,
      experience: parseInt((form.experience as HTMLInputElement).value) || 0
    };
    await updateProfile(data);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          {language === 'uz'
            ? 'Profilingizni to\'ldiring'
            : 'Заполните свой профиль'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.fullName}
            </label>
            <input
              type="text"
              name="full_name"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.phone}
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Tajriba (yil)' : 'Опыт (лет)'}
            </label>
            <input
              type="number"
              name="experience"
              min="0"
              defaultValue="0"
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {language === 'uz' ? 'Saqlash' : 'Сохранить'}
          </button>
        </form>
      </div>
    </div>
  );
};