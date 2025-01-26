import React, { useState } from 'react';
import { Settings, ChevronDown, Stethoscope } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { ServicesList } from './ServicesList';

interface ProfileServicesProps {
  services: any[];
  onAddService: () => void;
}

export const ProfileServices: React.FC<ProfileServicesProps> = ({
  services,
  onAddService
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-t border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">
              {t.services}
            </h3>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-2">
          <div className="flex justify-end mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddService();
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
            >
              <Settings className="w-5 h-5" />
              <span>{t.addService}</span>
            </button>
          </div>

          <ServicesList services={services} />
        </div>
      )}
    </div>
  );
};