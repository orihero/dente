import React from 'react';
import { useLanguageStore } from '../../../store/languageStore';

interface ServicesListProps {
  services: any[];
  loading: boolean;
  error: string | null;
  selectedServices: any[];
  onServiceSelect: (service: any) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  loading,
  error,
  selectedServices,
  onServiceSelect
}) => {
  const { language } = useLanguageStore();

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  return (
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
            {categoryGroup.services.length % 2 === 1 && <div />}
          </div>
        </div>
      ))}
    </div>
  );
};