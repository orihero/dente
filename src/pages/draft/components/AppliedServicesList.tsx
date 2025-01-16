import React from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  warranty: string;
  categoryColor: string;
}

interface ToothService {
  toothId: string;
  services: Service[];
}

interface AppliedServicesListProps {
  services: ToothService[];
}

export const AppliedServicesList: React.FC<AppliedServicesListProps> = ({
  services
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].draft;

  if (services.length === 0) return null;

  // Group services by service name
  const groupedServices = services.reduce((acc, toothService) => {
    toothService.services.forEach(service => {
      if (!acc[service.name]) {
        acc[service.name] = {
          service,
          teeth: [],
          totalPrice: 0
        };
      }
      acc[service.name].teeth.push(toothService.toothId);
      acc[service.name].totalPrice += service.price;
    });
    return acc;
  }, {} as Record<string, { service: Service; teeth: string[]; totalPrice: number }>);

  // Calculate grand total
  const grandTotal = Object.values(groupedServices).reduce(
    (sum, group) => sum + group.totalPrice, 
    0
  );

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">{t.appliedServices}</h2>
      <div className="space-y-4">
        {Object.entries(groupedServices).map(([serviceName, group]) => (
          <div 
            key={serviceName} 
            className="p-4 rounded-lg"
            style={{ backgroundColor: `${group.service.categoryColor}10` }}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-900">{serviceName}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  {t.duration}: {group.service.duration} • {t.warranty}: {group.service.warranty}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {group.totalPrice.toLocaleString()} UZS
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {group.service.price.toLocaleString()} UZS × {group.teeth.length}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {group.teeth.map(toothId => (
                <span
                  key={toothId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${group.service.categoryColor}20`,
                    color: group.service.categoryColor
                  }}
                >
                  {t.tooth} {toothId}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Grand Total */}
        <div className="border-t pt-4 mt-6">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">{t.totalAmount}:</span>
            <span className="text-xl font-bold text-gray-900">
              {grandTotal.toLocaleString()} UZS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};