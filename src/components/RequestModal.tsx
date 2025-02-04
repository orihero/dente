import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { supabase } from '../lib/supabase';

interface RequestModalProps {
  showModal: boolean;
  onClose: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  showModal,
  onClose
}) => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    type: '',
    description: ''
  });

  if (!showModal) return null;

  const requestTypes = [
    {
      value: 'feature',
      label: language === 'uz' ? 'Yangi funksiya' : 'Новая функция',
      description: language === 'uz'
        ? 'Yangi funksiya qo\'shish yoki mavjud funksiyani yaxshilash bo\'yicha taklif'
        : 'Предложение по добавлению новой функции или улучшению существующей'
    },
    {
      value: 'bug',
      label: language === 'uz' ? 'Xatolik' : 'Ошибка',
      description: language === 'uz'
        ? 'Tizimda aniqlangan xatolik yoki nosozlik haqida xabar'
        : 'Сообщение об обнаруженной ошибке или неисправности в системе'
    },
    {
      value: 'suggestion',
      label: language === 'uz' ? 'Taklif' : 'Предложение',
      description: language === 'uz'
        ? 'Tizimni yaxshilash bo\'yicha umumiy taklif yoki fikr'
        : 'Общее предложение или идея по улучшению системы'
    },
    {
      value: 'support',
      label: language === 'uz' ? 'Yordam' : 'Поддержка',
      description: language === 'uz'
        ? 'Texnik yordam yoki maslahat olish uchun so\'rov'
        : 'Запрос на техническую поддержку или консультацию'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error: requestError } = await supabase
        .from('dentist_requests')
        .insert({
          dentist_id: user.id,
          type: data.type,
          description: data.description
        });

      if (requestError) throw requestError;

      onClose();
      setData({ type: '', description: '' });
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {language === 'uz' ? 'Tizim so\'rovi' : 'Системный запрос'}
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
              {language === 'uz' ? 'So\'rov turi' : 'Тип запроса'}
            </label>
            <select
              required
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">
                {language === 'uz' ? 'So\'rov turini tanlang' : 'Выберите тип запроса'}
              </option>
              {requestTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {data.type && (
              <p className="mt-1 text-sm text-gray-500">
                {requestTypes.find(t => t.value === data.type)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'So\'rov mazmuni' : 'Содержание запроса'}
            </label>
            <textarea
              required
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={language === 'uz'
                ? 'So\'rovingizni batafsil yozing...'
                : 'Подробно опишите ваш запрос...'
              }
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading 
                ? (language === 'uz' ? 'Yuborilmoqda...' : 'Отправка...')
                : (language === 'uz' ? 'Yuborish' : 'Отправить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};