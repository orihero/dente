import React from 'react';
import { LayoutDashboard, Users, PhoneCall, Calendar, FileText, Settings, Building2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';

interface AdminSidebarProps {
  activeTab: 'overview' | 'leads' | 'dentists' | 'appointments' | 'records' | 'settings' | 'clinics';
  onTabChange: (tab: 'overview' | 'leads' | 'dentists' | 'appointments' | 'records' | 'settings' | 'clinics') => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  const { language } = useLanguageStore();

  const tabs = [
    {
      id: 'overview',
      label: language === 'uz' ? 'Umumiy ko\'rinish' : 'Обзор',
      icon: LayoutDashboard
    },
    {
      id: 'clinics',
      label: language === 'uz' ? 'Klinikalar' : 'Клиники',
      icon: Building2
    },
    {
      id: 'dentists',
      label: language === 'uz' ? 'Shifokorlar' : 'Врачи',
      icon: Users
    },
    {
      id: 'leads',
      label: language === 'uz' ? 'So\'rovlar' : 'Заявки',
      icon: PhoneCall
    },
    {
      id: 'appointments',
      label: language === 'uz' ? 'Qabullar' : 'Приёмы',
      icon: Calendar
    },
    {
      id: 'records',
      label: language === 'uz' ? 'Yozuvlar' : 'Записи',
      icon: FileText
    },
    {
      id: 'settings',
      label: language === 'uz' ? 'Sozlamalar' : 'Настройки',
      icon: Settings
    }
  ];

  return (
    <aside className="w-64 bg-white border-r min-h-screen">
      <nav className="p-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
              ${activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};