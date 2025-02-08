import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';
import { getServiceColor } from '../../../utils/serviceColors';

interface ApplyServiceModalProps {
  showModal: boolean;
  onClose: () => void;
  onApply: (services: any[]) => void;
  selectedServices: any[];
  modalTitle?: string;
}

export const ApplyServiceModal: React.FC<ApplyServiceModalProps> = ({
  showModal,
  onClose,
  onApply,
  selectedServices,
  modalTitle = 'Apply Services'
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any[]>(selectedServices);

  useEffect(() => {
    if (showModal) {
      fetchServices();
    }
  }, [showModal]);

  const fetchServices = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

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
              name_ru,
              color
            )
          )
        `)
        .eq('dentist_id', user.id)
        .order('created_at');

      if (error) throw error;

      // Group services by category
      const groupedServices = data?.reduce((acc, service) => {
        const categoryId = service.base_service.category.id;
        if (!acc[categoryId]) {
          acc[categoryId] = {
            category: service.base_service.category,
            services: []
          };
        }
        acc[categoryId].services.push(service);
        return acc;
      }, {});

      setServices(Object.values(groupedServices) || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to load services');
      setServices([]);
    }
  };

  const handleToggleService = (service: any) => {
    const exists = selectedServices?.some(s => s.id === service.id) || false;
    if (exists) {
      setSelected(selected.filter(s => s.id !== service.id));
    } else {
      setSelected([...selected, {
        id: service.id,
        name: language === 'uz' ? service.base_service.name_uz : service.base_service.name_ru,
        price: service.price,
        duration: service.duration,
        warranty: service.warranty,
        categoryId: service.base_service.category.id,
        categoryColor: service.base_service.category.color
      }]);
    }
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{modalTitle}</h2>
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

        <div className="p-4">
          <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto">
            {services.map((categoryGroup: any) => (
              <div key={categoryGroup.category.id} className="space-y-3">
                <h3 className="font-medium text-gray-900">
                  {language === 'uz' ? categoryGroup.category.name_uz : categoryGroup.category.name_ru}
                </h3>
                <div className="space-y-2">
                  {categoryGroup.services.map((service: any) => {
                    const isSelected = selected.some(s => s.id === service.id);
                    const opacity = isSelected ? 0.2 : 0.1;
                    const colorFn = getServiceColor(categoryGroup.category.id, opacity);
                    const backgroundColor = colorFn(categoryGroup.category.color);

                    return (
                      <button
                        key={service.id}
                        onClick={() => handleToggleService(service)}
                        className={`w-full flex items-start justify-between p-3 rounded-lg transition-colors ${
                          selectedServices?.some(s => s.id === service.id) ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        style={{ backgroundColor }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {language === 'uz' ? service.base_service.name_uz : service.base_service.name_ru}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Duration: {service.duration} • Warranty: {service.warranty}
                          </div>
                        </div>
                        <span className="font-medium">{service.price.toLocaleString()} UZS</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Selected Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};