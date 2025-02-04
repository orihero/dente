import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';

interface BaseServiceModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  service?: any;
}

export const BaseServiceModal: React.FC<BaseServiceModalProps> = ({
  showModal,
  onClose,
  onSuccess,
  service
}) => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [data, setData] = useState({
    name_uz: '',
    name_ru: '',
    category_id: '',
    order: 0
  });

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setData({
        name_uz: service.name_uz,
        name_ru: service.name_ru,
        category_id: service.category_id,
        order: service.order
      });
    } else {
      // Reset form for new service
      setData({
        name_uz: '',
        name_ru: '',
        category_id: categories[0]?.id || '',
        order: 0
      });
    }
  }, [service, categories]);

  useEffect(() => {
    if (showModal) {
      fetchCategories();
    }
  }, [showModal]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('order');

      if (error) throw error;
      setCategories(data || []);

      // Set first category as default for new services
      if (!service && data && data.length > 0) {
        setData(prev => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (service) {
        // Update existing service
        const { error } = await supabase
          .from('base_services')
          .update(data)
          .eq('id', service.id);

        if (error) throw error;
      } else {
        // Create new service
        const { error } = await supabase
          .from('base_services')
          .insert(data);

        if (error) throw error;
      }

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
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
            {service 
              ? (language === 'uz' ? 'Xizmatni tahrirlash' : 'Редактировать услугу')
              : (language === 'uz' ? 'Yangi xizmat' : 'Новая услуга')
            }
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
              {language === 'uz' ? 'Kategoriya' : 'Категория'}
            </label>
            <select
              required
              value={data.category_id}
              onChange={(e) => setData({ ...data, category_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">
                {language === 'uz' ? 'Kategoriyani tanlang' : 'Выберите категорию'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {language === 'uz' ? category.name_uz : category.name_ru}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Nomi (O\'zbekcha)' : 'Название (Узбекский)'}
            </label>
            <input
              type="text"
              required
              value={data.name_uz}
              onChange={(e) => setData({ ...data, name_uz: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Nomi (Ruscha)' : 'Название (Русский)'}
            </label>
            <input
              type="text"
              required
              value={data.name_ru}
              onChange={(e) => setData({ ...data, name_ru: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Tartib' : 'Порядок'}
            </label>
            <input
              type="number"
              required
              min="0"
              value={data.order}
              onChange={(e) => setData({ ...data, order: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};