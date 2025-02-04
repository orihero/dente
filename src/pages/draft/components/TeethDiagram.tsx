import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { ResponsiveTeethSvg } from '../../../components/ResponsiveTeethSvg';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { DiagramSwitches } from './DiagramSwitches';
import { ServicesList } from './ServicesList';

const SERVICES_STORAGE_KEY = 'dentist_services';

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
  const [loading, setLoading] = useState(true);
  const [isMilkTeeth, setIsMilkTeeth] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [diagramRight, setDiagramRight] = useState(false);

  useEffect(() => {
    if (showServices) {
      fetchServices();
    }
  }, [language, showServices]);

  const fetchServices = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }

      // Try to get services from local storage first
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        try {
          const data = JSON.parse(storedServices);
          const groupedServices = groupServicesByCategory(data);
          setServices(Object.values(groupedServices) || []);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing stored services:', e);
          localStorage.removeItem(SERVICES_STORAGE_KEY);
        }
      }

      // If not in local storage or invalid, fetch from API
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

      // Store in local storage
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(data));

      // Group services by category
      const groupedServices = groupServicesByCategory(data);
      setServices(Object.values(groupedServices) || []);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.message || 'Failed to load services');
      
      if (error.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const groupServicesByCategory = (data: any[]) => {
    return data.reduce((acc: any, service: any) => {
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
  };

  const handleTeethClick = (event: React.MouseEvent<SVGElement>) => {
    onTeethClick(event);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <DiagramSwitches
          isMilkTeeth={isMilkTeeth}
          setIsMilkTeeth={setIsMilkTeeth}
          showServices={showServices}
          setShowServices={setShowServices}
          diagramRight={diagramRight}
          setDiagramRight={setDiagramRight}
        />

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.clearAll}</span>
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-8 lg:gap-6">
        {/* Services List - Only visible when showServices is true */}
        {showServices && (
          <div className={`hidden lg:block ${diagramRight ? 'lg:col-span-5 lg:order-2' : 'lg:col-span-5 lg:order-1'} border-r pr-4`}>
            <ServicesList
              services={services}
              loading={loading}
              error={error}
              selectedServices={selectedServices}
              onServiceSelect={onServiceSelect}
            />
          </div>
        )}

        {/* Diagrams */}
        <div className={showServices ? `lg:col-span-3 ${diagramRight ? 'lg:order-1' : 'lg:order-2'}` : "lg:col-span-8"}>
          {showServices ? (
            // Show single diagram based on milk teeth switch
            <div className="h-[600px]">
              <ResponsiveTeethSvg 
                onClick={handleTeethClick}
                type={isMilkTeeth ? 'milk' : 'adult'}
              />
            </div>
          ) : (
            // Show both diagrams when services are off with 5% right offset and 96% scale
            <div className="grid grid-cols-2 gap-4 ml-[5%] mr-[-5%] scale-[0.96]">
              <div className="h-[600px]">
                <ResponsiveTeethSvg 
                  onClick={handleTeethClick}
                  type={isMilkTeeth ? 'milk-module' : 'module'}
                />
              </div>
              <div className="h-[600px]">
                <ResponsiveTeethSvg 
                  onClick={handleTeethClick}
                  type={isMilkTeeth ? 'milk' : 'adult'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};