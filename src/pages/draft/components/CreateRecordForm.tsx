import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PhoneInput } from '../../../components/PhoneInput';
import { DatePicker } from '../../../components/DatePicker';
import { CurrencyInput } from '../../../components/CurrencyInput';

interface ToothService {
  toothId: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    warranty: string;
    categoryId: string;
    categoryColor: string;
  }>;
}

interface CreateRecordFormProps {
  services: ToothService[];
  onClearAll: () => void;
}

export const CreateRecordForm: React.FC<CreateRecordFormProps> = ({
  services,
  onClearAll
}) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].draft;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    phone: '',
    full_name: '',
    birthdate: '',
    address: '',
    diagnosis: '',
    initial_payment: '',
    payment_type: '',
    total_price: services.reduce(
      (sum, toothService) => sum + toothService.services.reduce(
        (serviceSum, service) => serviceSum + service.price,
        0
      ),
      0
    ).toString()
  });

  // Check for existing patient when phone number is entered
  useEffect(() => {
    const checkPatient = async () => {
      if (data.phone.replace(/\D/g, '').length === 12) { // Complete phone number
        try {
          const { data: patients, error } = await supabase
            .from('patients')
            .select('*')
            .eq('phone', data.phone)
            .single();

          if (error) throw error;

          if (patients) {
            setData(prev => ({
              ...prev,
              full_name: patients.full_name,
              birthdate: patients.birthdate,
              address: patients.address || ''
            }));
          }
        } catch (error) {
          console.error('Error checking patient:', error);
        }
      }
    };

    checkPatient();
  }, [data.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First create or get patient
      let patientId: string;

      const { data: existingPatient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', data.phone)
        .single();

      if (patientError && patientError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw patientError;
      }

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        // Create new patient
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            dentist_id: user.id,
            full_name: data.full_name,
            phone: data.phone,
            birthdate: data.birthdate,
            address: data.address
          })
          .select()
          .single();

        if (createError) throw createError;
        patientId = newPatient.id;
      }

      // Create record
      const { data: record, error: recordError } = await supabase
        .from('patient_records')
        .insert({
          patient_id: patientId,
          dentist_id: user.id,
          diagnosis: data.diagnosis,
          total_price: parseInt(data.total_price.replace(/\D/g, ''))
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Create record services
      const recordServices = services.flatMap(toothService =>
        toothService.services.map(service => ({
          record_id: record.id,
          service_id: service.id,
          price: service.price,
          tooth_id: toothService.toothId
        }))
      );

      const { error: servicesError } = await supabase
        .from('record_services')
        .insert(recordServices);

      if (servicesError) throw servicesError;

      // Create initial payment if provided
      if (data.initial_payment && data.payment_type) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            patient_id: patientId,
            dentist_id: user.id,
            record_id: record.id,
            amount: parseInt(data.initial_payment.replace(/\D/g, '')),
            payment_type: data.payment_type
          });

        if (paymentError) throw paymentError;
      }

      // Clear form and services
      onClearAll();
      navigate(`/users/${patientId}`);
    } catch (error: any) {
      console.error('Error creating record:', error);
      setError(error.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  const paymentTypes = [
    { value: 'cash', label: t.cash },
    { value: 'card_transfer', label: t.cardTransfer },
    { value: 'card', label: t.card }
  ];

  return (
    <div className="mt-6 bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-6">{t.createRecord}</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.phone}
            </label>
            <PhoneInput
              value={data.phone}
              onChange={(value) => setData({ ...data, phone: value })}
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
              placeholder={t.fullNamePlaceholder}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.birthdate}
            </label>
            <DatePicker
              value={data.birthdate}
              onChange={(value) => setData({ ...data, birthdate: value })}
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
              placeholder={t.addressPlaceholder}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.diagnosis}
          </label>
          <textarea
            required
            value={data.diagnosis}
            onChange={(e) => setData({ ...data, diagnosis: e.target.value })}
            rows={3}
            placeholder={t.diagnosisPlaceholder}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.initialPayment}
            </label>
            <CurrencyInput
              value={data.initial_payment}
              onChange={(value) => setData({ ...data, initial_payment: value })}
              placeholder={t.initialPaymentPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.paymentType}
            </label>
            <div className="flex gap-2">
              {paymentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setData({ ...data, payment_type: type.value })}
                  className={`flex-1 px-3 py-2 rounded-md text-sm ${
                    data.payment_type === type.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <span className="text-sm text-gray-600">{t.totalAmount}:</span>
            <CurrencyInput
              value={data.total_price}
              onChange={(value) => setData({ ...data, total_price: value })}
              className="ml-2 text-2xl font-bold text-gray-900 w-48 bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !data.phone || !data.full_name || !data.birthdate}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? t.creating : t.create}
          </button>
        </div>
      </form>
    </div>
  );
};