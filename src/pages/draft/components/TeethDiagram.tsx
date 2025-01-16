import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ResponsiveTeethSvg } from '../../../components/ResponsiveTeethSvg';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface TeethDiagramProps {
  onTeethClick: (event: React.MouseEvent<SVGElement>) => void;
  onClearAll: () => void;
  onServiceSelect: (service: any) => void;
  selectedServices: any[];
}

export const TeethDiagram: React.FC<TeethDiagramProps> = ({
  onTeethClick,
  onClearAll,
  onServiceSelect,
  selectedServices
}) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].draft;
  const [services, setServices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

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
        .eq('dentist_id', session.user.id)
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
        acc[categoryId].services.push({
          id: service.id,
          name: language === 'uz' ? service.base_service.name_uz : service.base_service.name_ru,
          price: service.price,
          duration: service.duration,
          warranty: service.warranty,
          categoryId: service.base_service.category.id,
          categoryColor: service.base_service.category.color
        });
        return acc;
      }, {});

      setServices(Object.values(groupedServices) || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to load services');
      
      if (error.status === 401) {
        navigate('/login');
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clearAll}</span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-8 lg:gap-6">
        {/* Services List - Only visible on desktop */}
        <div className="hidden lg:block lg:col-span-5 border-r pr-4">
          <div className="h-[600px] overflow-y-auto pr-2">
            {services.map((categoryGroup: any) => (
              <div key={categoryGroup.category.id} className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3 sticky top-0 bg-white py-1">
                  {language === 'uz' ? categoryGroup.category.name_uz : categoryGroup.category.name_ru}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {categoryGroup.services.map((service: any) => {
                    const isSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => onServiceSelect(service)}
                        className={`p-2 rounded-lg text-sm text-left transition-colors ${
                          isSelected ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        style={{ backgroundColor: `${categoryGroup.category.color}10` }}
                      >
                        <div>
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {service.duration} • {service.warranty}
                          </span>
                          <span className="text-xs text-gray-900">
                            {service.price.toLocaleString()} UZS
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  {/* Add an empty div if there's only one service to maintain grid layout */}
                  {categoryGroup.services.length % 2 === 1 && <div />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teeth Diagram */}
        <div className="lg:col-span-3">
          <div className="h-[600px]">
            <ResponsiveTeethSvg onClick={onTeethClick} />
          </div>
        </div>
      </div>
    </div>
  );
};