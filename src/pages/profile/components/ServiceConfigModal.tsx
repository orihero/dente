import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface ServiceConfigModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

interface BaseService {
  id: string;
  category_id: string;
  name_uz: string;
  name_ru: string;
}

interface ServiceCategory {
  id: string;
  name_uz: string;
  name_ru: string;
}

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<BaseService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [data, setData] = useState({
    base_service_id: '',
    price: '',
    duration: '',
    warranty_months: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadServices(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('order');

      if (error) throw error;
      setCategories(categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadServices = async (categoryId: string) => {
    try {
      const { data: services, error } = await supabase
        .from('base_services')
        .select('*')
        .eq('category_id', categoryId)
        .order('order');

      if (error) throw error;
      setServices(services || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('dentist_services')
        .insert({
          dentist_id: user.id,
          base_service_id: data.base_service_id,
          price: parseFloat(data.price),
          duration: data.duration,
          warranty_months: parseInt(data.warranty_months)
        });

      if (error) throw error;
      await onSubmit();
      onClose();
      setData({
        base_service_id: '',
        price: '',
        duration: '',
        warranty_months: ''
      });
      setSelectedCategory('');
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.addService}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {language === 'uz' ? category.name_uz : category.name_ru}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              required
              value={data.base_service_id}
              onChange={(e) => setData({ ...data, base_service_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {language === 'uz' ? service.name_uz : service.name_ru}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.price}
            </label>
            <input
              type="number"
              required
              min="0"
              value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.duration}
            </label>
            <input
              type="text"
              required
              value={data.duration}
              onChange={(e) => setData({ ...data, duration: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.warranty}
            </label>
            <input
              type="number"
              required
              min="0"
              value={data.warranty_months}
              onChange={(e) => setData({ ...data, warranty_months: e.target.value })}
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
              disabled={loading}
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