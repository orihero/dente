import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { adminSupabase, ensureAdmin } from '../../../lib/adminSupabase';
import { PhoneInput } from '../../../components/PhoneInput';

interface DentistFormProps {
  dentist?: any;
  clinics: any[];
  onSubmit: () => Promise<void>;
  loading: boolean;
}

export const DentistForm: React.FC<DentistFormProps> = ({
  dentist,
  clinics,
  onSubmit,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    type: 'regular',
    clinic_id: '',
    subscription_months: ''
  });

  useEffect(() => {
    if (dentist) {
      setData({
        email: dentist.email || '',
        password: '',
        full_name: dentist.full_name || '',
        phone: dentist.phone || '',
        type: dentist.type || 'regular',
        clinic_id: dentist.clinic_id || '',
        subscription_months: ''
      });
    } else {
      // Reset form for new dentist
      setData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        type: 'regular',
        clinic_id: '',
        subscription_months: ''
      });
    }
  }, [dentist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // Ensure admin access first
      await ensureAdmin();

      if (dentist) {
        // Update existing dentist
        const { error: updateError } = await adminSupabase
          .from('dentists')
          .update({
            full_name: data.full_name,
            phone: data.phone,
            type: data.type,
            clinic_id: data.clinic_id || null
          })
          .eq('id', dentist.id);

        if (updateError) throw updateError;

        // Update subscription if months selected
        if (data.subscription_months) {
          const { error: subscriptionError } = await adminSupabase.rpc('extend_dentist_subscription', {
            dentist_id: dentist.id,
            months: parseInt(data.subscription_months)
          });

          if (subscriptionError) throw subscriptionError;
        }
      } else {
        // Create new dentist
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
            type: data.type,
            clinic_id: data.clinic_id || null
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        // Set initial subscription if months selected
        if (data.subscription_months) {
          const { error: subscriptionError } = await adminSupabase.rpc('extend_dentist_subscription', {
            dentist_id: authData.user.id,
            months: parseInt(data.subscription_months)
          });

          if (subscriptionError) throw subscriptionError;
        }
      }

      await onSubmit();
    } catch (error: any) {
      console.error('Error saving dentist:', error);
      setError(error.message);
    }
  };

  const subscriptionOptions = [
    { value: '1', label: language === 'uz' ? '1 oy' : '1 месяц' },
    { value: '3', label: language === 'uz' ? '3 oy' : '3 месяца' },
    { value: '6', label: language === 'uz' ? '6 oy' : '6 месяцев' },
    { value: '12', label: language === 'uz' ? '1 yil' : '1 год' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-red-100 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {!dentist && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
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
        </>
      )}

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
        <PhoneInput
          value={data.phone}
          onChange={(value) => setData({ ...data, phone: value })}
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

      {/* Subscription Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {language === 'uz' ? 'Obuna sozlamalari' : 'Настройки подписки'}
        </h3>
        
        {dentist && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              {language === 'uz' ? 'Joriy holat' : 'Текущий статус'}:
              <span className={`ml-2 font-medium ${
                dentist.subscription_status === 'active' ? 'text-green-600' : 'text-red-600'
              }`}>
                {dentist.subscription_status === 'active' 
                  ? (language === 'uz' ? 'Faol' : 'Активный')
                  : (language === 'uz' ? 'Faol emas' : 'Неактивный')
                }
              </span>
            </div>
            {dentist.subscription_ends_at && (
              <div className="text-sm text-gray-600 mt-1">
                {language === 'uz' ? 'Tugash sanasi' : 'Дата окончания'}:
                <span className="ml-2 font-medium">
                  {new Date(dentist.subscription_ends_at).toLocaleDateString(
                    language === 'uz' ? 'uz-UZ' : 'ru-RU'
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Obuna muddati' : 'Срок подписки'}
          </label>
          <select
            value={data.subscription_months}
            onChange={(e) => setData({ ...data, subscription_months: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">
              {language === 'uz' ? 'Muddatni tanlang' : 'Выберите срок'}
            </option>
            {subscriptionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-gray-500">
            {dentist
              ? (language === 'uz' 
                  ? 'Tanlangan muddat joriy obunaga qo\'shiladi'
                  : 'Выбранный срок будет добавлен к текущей подписке')
              : (language === 'uz'
                  ? 'Tanlangan muddat yangi obuna uchun ishlatiladi'
                  : 'Выбранный срок будет использован для новой подписки')
            }
          </p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading 
            ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...') 
            : (language === 'uz' ? 'Saqlash' : 'Сохранить')
          }
        </button>
      </div>
    </form>
  );
};