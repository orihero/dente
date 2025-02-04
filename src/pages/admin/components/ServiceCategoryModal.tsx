import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';

interface ServiceCategoryModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  category?: any;
}

export const ServiceCategoryModal: React.FC<ServiceCategoryModalProps> = ({
  showModal,
  onClose,
  onSuccess,
  category
}) => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    name_uz: '',
    name_ru: '',
    color: '#4F46E5',
    order: 0
  });

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setData({
        name_uz: category.name_uz,
        name_ru: category.name_ru,
        color: category.color,
        order: category.order
      });
    } else {
      // Reset form for new category
      setData({
        name_uz: '',
        name_ru: '',
        color: '#4F46E5',
        order: 0
      });
    }
  }, [category]);

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('service_categories')
          .update(data)
          .eq('id', category.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('service_categories')
          .insert(data);

        if (error) throw error;
      }

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
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
            {category 
              ? (language === 'uz' ? 'Kategoriyani tahrirlash' : 'Редактировать категорию')
              : (language === 'uz' ? 'Yangi kategoriya' : 'Новая категория')
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
              {language === 'uz' ? 'Rang' : 'Цвет'}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.color}
                onChange={(e) => setData({ ...data, color: e.target.value })}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={data.color}
                onChange={(e) => setData({ ...data, color: e.target.value })}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
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