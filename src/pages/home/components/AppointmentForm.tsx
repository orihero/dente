import React from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface AppointmentFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onAddNewPatient: () => void;
  patients: any[];
  data: {
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
  };
  setData: (data: any) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  loading,
  onSubmit,
  onAddNewPatient,
  patients,
  data,
  setData,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patient
        </label>
        <select
          required
          value={data.patient_id}
          onChange={(e) => setData({ ...data, patient_id: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={data.appointment_date}
            onChange={(e) => setData({ ...data, appointment_date: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            type="time"
            required
            value={data.appointment_time}
            onChange={(e) => setData({ ...data, appointment_time: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onAddNewPatient}
          className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
        >
          Add New Patient
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Appointment'}
        </button>
      </div>
    </form>
  );
};