import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';
import { CurrencyInput } from '../../../components/CurrencyInput';

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
  const [records, setRecords] = useState<any[]>([]);
  const [showRecordSelect, setShowRecordSelect] = useState(false);
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

      if (data && data.length > 0) {
        setRecords(data);
        // Automatically select the latest record
        setData(prev => ({ ...prev, record_id: data[0].id }));
      }
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

  const selectedRecord = records.find(record => record.id === data.record_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          showModal ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{t.addPayment}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Record
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecordSelect(!showRecordSelect)}
                  className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                >
                  <span>{showRecordSelect ? 'Hide' : 'Change'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showRecordSelect ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {showRecordSelect ? (
                <select
                  required
                  value={data.record_id}
                  onChange={(e) => setData({ ...data, record_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select record</option>
                  {records.map((record) => (
                    <option key={record.id} value={record.id}>
                      #{formatRecordNumber(record.record_number)} - {record.diagnosis.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              ) : selectedRecord && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">#{formatRecordNumber(selectedRecord.record_number)}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedRecord.diagnosis}</p>
                    </div>
                    <p className="font-medium text-red-600">
                      {selectedRecord.total_price.toLocaleString()} UZS
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.amount}
              </label>
              <CurrencyInput
                value={data.amount}
                onChange={(value) => setData({ ...data, amount: value })}
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
                disabled={loading || !data.record_id || !data.amount || !data.payment_type}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t.creating : t.create}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};