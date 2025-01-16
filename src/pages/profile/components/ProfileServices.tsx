import React from 'react';
import { Settings } from 'lucide-react';
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

  return (
    <div className="border-t border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {t.services}
          </h3>
          <button
            onClick={onAddService}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
          >
            <Settings className="w-5 h-5" />
            <span>{t.addService}</span>
          </button>
        </div>

        <ServicesList services={services} />
      </div>
    </div>
  );
};