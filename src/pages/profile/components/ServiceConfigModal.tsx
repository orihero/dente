import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';
import { CurrencyInput } from '../../../components/CurrencyInput';
import { Switch } from '../../../components/Switch';

interface ServiceConfigModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
}

interface ServiceData {
  id: string;
  base_service_id: string;
  price: string;
  duration: string;
  warranty: string;
  name_uz: string;
  name_ru: string;
  category_name_uz: string;
  category_name_ru: string;
}

const SERVICES_STORAGE_KEY = 'dentist_services';

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, ServiceData>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (showModal) {
      loadCategories();
      loadExistingServices();
    }
  }, [showModal]);

  useEffect(() => {
    if (activeCategory) {
      loadServices(activeCategory);
    }
  }, [activeCategory]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('order');

      if (error) throw error;
      setCategories(data || []);
      
      // Set first category as active by default
      if (data && data.length > 0 && !activeCategory) {
        setActiveCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadExistingServices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First try to load from local storage
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        const parsedServices = JSON.parse(storedServices);
        const servicesMap: Record<string, ServiceData> = {};
        parsedServices.forEach((service: any) => {
          servicesMap[service.base_service.id] = {
            id: service.id,
            base_service_id: service.base_service.id,
            price: service.price ? `${service.price.toLocaleString()} UZS` : '',
            duration: service.duration,
            warranty: service.warranty || '',
            name_uz: service.base_service.name_uz,
            name_ru: service.base_service.name_ru,
            category_name_uz: service.base_service.category.name_uz,
            category_name_ru: service.base_service.category.name_ru
          };
        });
        setSelectedServices(servicesMap);
        return;
      }

      // If not in local storage, fetch from API
      const { data, error } = await supabase
        .from('dentist_services')
        .select(`
          *,
          base_service:base_services(
            id,
            name_uz,
            name_ru,
            category:service_categories(
              id,
              name_uz,
              name_ru
            )
          )
        `)
        .eq('dentist_id', user.id);

      if (error) throw error;

      // Store in local storage
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data));

      const servicesMap: Record<string, ServiceData> = {};
      data?.forEach(service => {
        servicesMap[service.base_service.id] = {
          id: service.id,
          base_service_id: service.base_service.id,
          price: service.price ? `${service.price.toLocaleString()} UZS` : '',
          duration: service.duration,
          warranty: service.warranty || '',
          name_uz: service.base_service.name_uz,
          name_ru: service.base_service.name_ru,
          category_name_uz: service.base_service.category.name_uz,
          category_name_ru: service.base_service.category.name_ru
        };
      });

      setSelectedServices(servicesMap);
    } catch (error) {
      console.error('Error loading existing services:', error);
    }
  };

  const loadServices = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('base_services')
        .select('*')
        .eq('category_id', categoryId)
        .order('order');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleServiceToggle = (service: any) => {
    setSelectedServices(prev => {
      const newServices = { ...prev };
      if (newServices[service.id]) {
        delete newServices[service.id];
      } else {
        newServices[service.id] = {
          id: '',
          base_service_id: service.id,
          price: '',
          duration: '30 min',
          warranty: '',
          name_uz: service.name_uz,
          name_ru: service.name_ru,
          category_name_uz: categories.find(c => c.id === service.category_id)?.name_uz || '',
          category_name_ru: categories.find(c => c.id === service.category_id)?.name_ru || ''
        };
      }
      return newServices;
    });
  };

  const validateServices = () => {
    const errors: string[] = [];
    Object.values(selectedServices).forEach(service => {
      const price = parseFloat(service.price.replace(/[^\d.]/g, ''));
      if (!price || isNaN(price) || price <= 0) {
        errors.push(
          language === 'uz' 
            ? `"${service.name_uz}" uchun narx kiritilmagan`
            : `Не указана цена для "${service.name_ru}"`
        );
      }
      if (!service.duration) {
        errors.push(
          language === 'uz'
            ? `"${service.name_uz}" uchun davomiylik kiritilmagan`
            : `Не указана длительность для "${service.name_ru}"`
        );
      }
    });
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // Validate services
      const validationErrors = validateServices();
      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error(language === 'uz' ? 'Avtorizatsiya talab qilinadi' : 'Требуется авторизация');

      // First delete all existing services
      const { error: deleteError } = await supabase
        .from('dentist_services')
        .delete()
        .eq('dentist_id', user.id);

      if (deleteError) throw deleteError;

      // Then insert new services
      const services = Object.values(selectedServices).map(service => ({
        dentist_id: user.id,
        base_service_id: service.base_service_id,
        price: parseFloat(service.price.replace(/[^\d.]/g, '')),
        duration: service.duration,
        warranty: service.warranty || ''
      }));

      const { data, error } = await supabase
        .from('dentist_services')
        .insert(services)
        .select(`
          *,
          base_service:base_services(
            id,
            name_uz,
            name_ru,
            category:service_categories(
              id,
              name_uz,
              name_ru
            )
          )
        `);

      if (error) throw error;

      // Update local storage with new data
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data));

      await onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error updating services:', error);
      setError(language === 'uz' ? 'Xizmatlarni yangilashda xatolik yuz berdi' : 'Ошибка при обновлении услуг');
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {language === 'uz' ? 'Xizmatlarni sozlash' : 'Настройка услуг'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-start gap-2 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          {/* Categories Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                    ${activeCategory === category.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {language === 'uz' ? category.name_uz : category.name_ru}
                </button>
              ))}
            </nav>
          </div>

          {/* Services List */}
          <div className="mt-4 space-y-4">
            {services.map((service) => {
              const isSelected = !!selectedServices[service.id];
              return (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {language === 'uz' ? service.name_uz : service.name_ru}
                      </h4>
                    </div>
                    <Switch
                      checked={isSelected}
                      onChange={() => handleServiceToggle(service)}
                    />
                  </div>

                  {isSelected && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'uz' ? 'Narx' : 'Цена'}
                        </label>
                        <CurrencyInput
                          value={selectedServices[service.id].price}
                          onChange={(value) => setSelectedServices(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], price: value }
                          }))}
                          placeholder={language === 'uz' ? 'Narxni kiriting' : 'Введите цену'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'uz' ? 'Davomiyligi' : 'Длительность'}
                        </label>
                        <input
                          type="text"
                          value={selectedServices[service.id].duration}
                          onChange={(e) => setSelectedServices(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], duration: e.target.value }
                          }))}
                          placeholder={language === 'uz' ? '30 min' : '30 мин'}
                          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'uz' ? 'Kafolat' : 'Гарантия'}
                        </label>
                        <input
                          type="text"
                          value={selectedServices[service.id].warranty}
                          onChange={(e) => setSelectedServices(prev => ({
                            ...prev,
                            [service.id]: { ...prev[service.id], warranty: e.target.value }
                          }))}
                          placeholder={language === 'uz' ? '6 oy' : '6 месяцев'}
                          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 mt-6">
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