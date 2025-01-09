import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';
import { supabase } from '../../../lib/supabase';

interface AppointmentFormProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  data: {
    patient_id: string;
    appointment_date: string;
    appointment_time: string;
    notes: string;
    phone: string;
    full_name: string;
    address: string;
    birthdate: string;
  };
  setData: (data: any) => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  loading,
  onSubmit,
  data,
  setData,
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  const handlePhoneChange = async (value: string) => {
    setData({ ...data, phone: value });
    
    // Reset existing patient state when phone number changes
    if (isExistingPatient) {
      setIsExistingPatient(false);
    }
    
    // Only check for existing patient if phone number is complete
    if (value.replace(/\D/g, '').length === 12) { // +998 XX XXX XX XX
      try {
        const { data: patients, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', value);

        if (error) throw error;

        if (patients && patients.length > 0) {
          const patient = patients[0];
          setIsExistingPatient(true);
          setData(prev => ({
            ...prev,
            patient_id: patient.id,
            full_name: patient.full_name,
            birthdate: patient.birthdate,
            address: patient.address || ''
          }));
        } else {
          // Clear patient data if no match found
          setData(prev => ({
            ...prev,
            patient_id: '',
            full_name: '',
            birthdate: '',
            address: ''
          }));
        }
      } catch (error) {
        console.error('Error checking patient:', error);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.phone}
        </label>
        <PhoneInput
          value={data.phone}
          onChange={handlePhoneChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.fullName}
        </label>
        <input
          type="text"
          required
          value={data.full_name}
          onChange={(e) => setData({ ...data, full_name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          readOnly={isExistingPatient}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.address}
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          readOnly={isExistingPatient}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.birthdate}
        </label>
        <input
          type="date"
          required
          value={data.birthdate}
          onChange={(e) => setData({ ...data, birthdate: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          readOnly={isExistingPatient}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.day}
          </label>
          <select
            required
            value={data.appointment_date.split('-')[2]}
            onChange={(e) => {
              const [year, month] = data.appointment_date.split('-');
              setData({ 
                ...data, 
                appointment_date: `${year}-${month}-${e.target.value.padStart(2, '0')}` 
              });
            }}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">{t.day}</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.month}
          </label>
          <select
            required
            value={data.appointment_date.split('-')[1]}
            onChange={(e) => {
              const [year, _, day] = data.appointment_date.split('-');
              setData({ 
                ...data, 
                appointment_date: `${year}-${e.target.value}-${day}` 
              });
            }}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">{t.month}</option>
            {[...Array(12)].map((_, i) => {
              const monthNum = i + 1;
              return (
                <option key={monthNum} value={monthNum.toString().padStart(2, '0')}>
                  {t.months[monthNum as keyof typeof t.months]}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.time}
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
          {t.notes}
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? t.creating : t.create}
      </button>
    </form>
  );
};