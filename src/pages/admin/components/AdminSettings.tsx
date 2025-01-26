import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';

export const AdminSettings: React.FC = () => {
  const { language } = useLanguageStore();
  const [groupChatId, setGroupChatId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('project_settings')
        .select('telegram_group_chat_id')
        .single();

      if (error) throw error;
      setGroupChatId(data?.telegram_group_chat_id || '');
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.rpc('update_project_telegram_settings', {
        group_chat_id: groupChatId
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'uz' ? 'Sozlamalar' : 'Настройки'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
            {language === 'uz' 
              ? 'Sozlamalar muvaffaqiyatli saqlandi'
              : 'Настройки успешно сохранены'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' 
                ? 'Telegram guruh chat ID'
                : 'ID группового чата Telegram'}
            </label>
            <input
              type="text"
              value={groupChatId}
              onChange={(e) => setGroupChatId(e.target.value)}
              placeholder={language === 'uz' 
                ? 'Guruh chat ID sini kiriting'
                : 'Введите ID группового чата'}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {language === 'uz'
                ? 'Bot guruhga admin sifatida qo\'shilgan bo\'lishi kerak'
                : 'Бот должен быть добавлен в группу как администратор'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading 
              ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
              : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
          </button>
        </form>
      </div>
    </div>
  );
};