import React from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { NewPatientForm } from './NewPatientForm';
import { AppointmentForm } from './AppointmentForm';

interface NewAppointmentModalProps {
  showModal: boolean;
  onClose: () => void;
  showNewPatientForm: boolean;
  setShowNewPatientForm: (show: boolean) => void;
  loading: boolean;
  onCreatePatient: (e: React.FormEvent) => Promise<void>;
  onCreateAppointment: (e: React.FormEvent) => Promise<void>;
  patients: any[];
  appointmentData: any;
  setAppointmentData: (data: any) => void;
  newPatientData: any;
  setNewPatientData: (data: any) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  showModal,
  onClose,
  showNewPatientForm,
  setShowNewPatientForm,
  loading,
  onCreatePatient,
  onCreateAppointment,
  patients,
  appointmentData,
  setAppointmentData,
  newPatientData,
  setNewPatientData,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.newAppointment}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {showNewPatientForm ? (
            <NewPatientForm
              loading={loading}
              onSubmit={onCreatePatient}
              onCancel={() => setShowNewPatientForm(false)}
              data={newPatientData}
              setData={setNewPatientData}
            />
          ) : (
            <AppointmentForm
              loading={loading}
              onSubmit={onCreateAppointment}
              onAddNewPatient={() => setShowNewPatientForm(true)}
              patients={patients}
              data={appointmentData}
              setData={setAppointmentData}
            />
          )}
        </div>
      </div>
    </div>
  );
};