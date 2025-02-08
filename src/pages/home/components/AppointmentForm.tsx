import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';
import { DatePicker } from '../../../components/DatePicker';
import { supabase } from '../../../lib/supabase';
import { ApplyServiceModal } from '../../users/components/ApplyServiceModal';

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
    services: any[];
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
  const [showServiceModal, setShowServiceModal] = useState(false);

  const handlePhoneChange = async (value: string) => {
    setData({ ...data, phone: value });
    
    // Reset existing patient state when phone number changes
    if (isExistingPatient) {
      setIsExistingPatient(false);
    }
    
    // Only check for existing patient if phone number is complete (12 digits)
    if (value.length === 12) {
      try {
        const { data: patients, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', value)
          .maybeSingle();

        if (error) throw error;

        if (patients) {
          setIsExistingPatient(true);
          setData(prev => ({
            ...prev,
            patient_id: patients.id,
            full_name: patients.full_name,
            birthdate: patients.birthdate,
            address: patients.address || ''
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

  // Generate time slots from 9:00 to 21:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handleServiceSelect = (services: any[]) => {
    setData(prev => ({
      ...prev,
      services
    }));
    setShowServiceModal(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
        <DatePicker
          value={data.birthdate}
          onChange={(value) => setData({ ...data, birthdate: value })}
          className={isExistingPatient ? 'opacity-50 cursor-not-allowed' : ''}
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.time}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {generateTimeSlots().map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setData({ ...data, appointment_time: time })}
              className={`
                p-2 text-sm rounded-md transition-colors duration-200
                ${data.appointment_time === time
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-gray-900'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {language === 'uz' ? 'Xizmatlar' : 'Услуги'}
          </label>
          <button
            type="button"
            onClick={() => setShowServiceModal(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-4 h-4" />
            {language === 'uz' ? 'Xizmat qo\'shish' : 'Добавить услугу'}
          </button>
        </div>
        
        {data.services && data.services.length > 0 ? (
          <div className="space-y-2">
            {data.services.map((service, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between">
                  <span className="font-medium">{service.name}</span>
                  <span>{service.price.toLocaleString()} UZS</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {language === 'uz' ? 'Davomiyligi' : 'Длительность'}: {service.duration} • 
                  {language === 'uz' ? 'Kafolat' : 'Гарантия'}: {service.warranty}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
            {language === 'uz' ? 'Xizmatlar qo\'shilmagan' : 'Нет добавленных услуг'}
          </div>
        )}
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
        disabled={loading || !data.phone || !data.full_name || !data.birthdate}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? t.creating : t.create}
      </button>

      <ApplyServiceModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onApply={handleServiceSelect}
        selectedServices={data.services}
      />
    </form>
  );
};