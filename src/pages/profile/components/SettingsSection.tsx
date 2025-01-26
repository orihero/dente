import React, { useState } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { TelegramBotSettings } from './settings/TelegramBotSettings';
import { LoyaltyProgramsSection } from './settings/LoyaltyProgramsSection';
import { MessageTemplatesSection } from './settings/MessageTemplatesSection';
import { AppointmentSettings } from './settings/AppointmentSettings';
import { PublicProfileSection } from './settings/PublicProfileSection';

interface SettingsSectionProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

interface SettingsItem {
  id: string;
  title: {
    uz: string;
    ru: string;
  };
  Component: React.FC<any>;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSettings, setExpandedSettings] = useState<string[]>([]);

  const settingsItems: SettingsItem[] = [
    { 
      id: 'appointments', 
      title: {
        uz: 'Qabul sozlamalari',
        ru: 'Настройки приёмов'
      },
      Component: AppointmentSettings 
    },
    { 
      id: 'telegram', 
      title: {
        uz: 'Telegram bot',
        ru: 'Telegram бот'
      },
      Component: TelegramBotSettings 
    },
    { 
      id: 'loyalty', 
      title: {
        uz: 'Sodiqlik dasturlari',
        ru: 'Программы лояльности'
      },
      Component: LoyaltyProgramsSection 
    },
    { 
      id: 'messages', 
      title: {
        uz: 'Xabar shablonlari',
        ru: 'Шаблоны сообщений'
      },
      Component: MessageTemplatesSection 
    },
    {
      id: 'public_profile',
      title: {
        uz: 'Ommaviy profil',
        ru: 'Публичный профиль'
      },
      Component: PublicProfileSection
    }
  ];

  const toggleSetting = (id: string) => {
    setExpandedSettings(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="border-t border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">
              {t.settings}
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
        <div className="p-6 pt-2 space-y-8">
          {settingsItems.map(({ id, title, Component }) => (
            <div key={id} className="border-b border-gray-200 last:border-b-0 pb-8 last:pb-0">
              <div 
                className="flex justify-between items-center cursor-pointer mb-4"
                onClick={() => toggleSetting(id)}
              >
                <h4 className="font-medium text-gray-900">
                  {title[language as keyof typeof title]}
                </h4>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    expandedSettings.includes(id) ? 'transform rotate-180' : ''
                  }`} 
                />
              </div>
              
              {expandedSettings.includes(id) && (
                <Component
                  dentistId={dentistId}
                  onRefresh={onRefresh}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};