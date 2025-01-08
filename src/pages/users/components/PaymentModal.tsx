import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';

interface PaymentModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  patientId: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  patientId
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [records, setRecords] = useState([]);
  const [data, setData] = useState({
    record_id: '',
    amount: '',
    payment_type: '',
    notes: ''
  });

  useEffect(() => {
    if (showModal) {
      fetchRecords();
    }
  }, [showModal]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select('*, services:record_services(price)')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(data);
    setData({
      record_id: '',
      amount: '',
      payment_type: '',
      notes: ''
    });
  };

  const paymentTypes = [
    { value: 'cash', label: t.cash },
    { value: 'card_transfer', label: t.cardTransfer },
    { value: 'card', label: t.card }
  ];

  const formatRecordNumber = (num: number) => {
    return String(num).padStart(6, '0');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.addPayment}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record
            </label>
            <select
              required
              value={data.record_id}
              onChange={(e) => setData({ ...data, record_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select record</option>
              {records.map((record: any) => (
                <option key={record.id} value={record.id}>
                  #{formatRecordNumber(record.record_number)} - {record.diagnosis.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.amount}
            </label>
            <input
              type="number"
              required
              min="0"
              value={data.amount}
              onChange={(e) => setData({ ...data, amount: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? t.creating : t.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};