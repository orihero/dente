import React from 'react';
import { Clock, Shield } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface Service {
  id: string;
  base_service: {
    id: string;
    name_uz: string;
    name_ru: string;
    category: {
      id: string;
      name_uz: string;
      name_ru: string;
    };
  };
  price: number;
  duration: string;
  warranty: string;
}

interface ServicesListProps {
  services: Service[];
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categoryId = service.base_service.category.id;
    if (!acc[categoryId]) {
      acc[categoryId] = {
        category: service.base_service.category,
        services: []
      };
    }
    acc[categoryId].services.push(service);
    return acc;
  }, {} as Record<string, { category: Service['base_service']['category']; services: Service[] }>);

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'uz' ? 'Xizmatlar qo`shilmagan' : 'Нет добавленных услуг'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {Object.values(servicesByCategory).map(({ category, services }) => (
        <div key={category.id} className="py-4">
          <h4 className="font-medium text-gray-900 mb-4">
            {language === 'uz' ? category.name_uz : category.name_ru}
          </h4>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">
                      {language === 'uz' ? service.base_service.name_uz : service.base_service.name_ru}
                    </h5>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">
                          {language === 'uz' ? 'Davomiyligi: ' : 'Длительность: '}
                          {service.duration}
                        </span>
                      </div>
                      {service.warranty && (
                        <div className="flex items-center text-gray-600">
                          <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">
                            {language === 'uz' ? 'Kafolat: ' : 'Гарантия: '}
                            {service.warranty}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-medium text-indigo-600">
                      {service.price.toLocaleString()} UZS
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};