import React from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { AppointmentForm } from './AppointmentForm';

interface NewAppointmentModalProps {
  showModal: boolean;
  onClose: () => void;
  loading: boolean;
  onCreateAppointment: (e: React.FormEvent) => Promise<void>;
  appointmentData: any;
  setAppointmentData: (data: any) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  showModal,
  onClose,
  loading,
  onCreateAppointment,
  appointmentData,
  setAppointmentData,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;

  if (!showModal) return null;

  const currentDate = new Date();
  const dayNames = {
    uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
  };

  const currentDay = dayNames[language][currentDate.getDay()];
  const formattedDate = currentDate.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showModal ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-lg font-semibold">{t.newAppointment}</h2>
              <div className="mt-1">
                <div className="text-lg font-medium">{currentDay}</div>
                <div className="text-sm text-gray-600">{formattedDate}</div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <AppointmentForm
              loading={loading}
              onSubmit={onCreateAppointment}
              data={appointmentData}
              setData={setAppointmentData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};