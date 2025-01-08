import React from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface Service {
  id: string;
  service: {
    name: string;
    description: string;
    section: string;
  };
  price: number;
  warranty_end: string | null;
  notes: string | null;
  created_at: string;
}

interface ServicesListProps {
  services: Service[];
  onRefresh: () => Promise<void>;
}

export const ServicesList: React.FC<ServicesListProps> = ({ services }) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noServices}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {services.map((service) => (
        <div key={service.id} className="py-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">
                {service.service.name}
              </h4>
              {service.service.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {service.service.description}
                </p>
              )}
              <p className="text-sm text-indigo-600 mt-1">
                {service.service.section}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                {service.price.toLocaleString(language === 'uz' ? 'uz-UZ' : 'ru-RU')}
              </p>
              {service.warranty_end && (
                <p className="text-sm text-gray-600 mt-1">
                  {t.warrantyUntil}: {new Date(service.warranty_end).toLocaleDateString(
                    language === 'uz' ? 'uz-UZ' : 'ru-RU'
                  )}
                </p>
              )}
            </div>
          </div>
          {service.notes && (
            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
              {service.notes}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {new Date(service.created_at).toLocaleDateString(
              language === 'uz' ? 'uz-UZ' : 'ru-RU',
              { year: 'numeric', month: 'long', day: 'numeric' }
            )}
          </p>
        </div>
      ))}
    </div>
  );
};