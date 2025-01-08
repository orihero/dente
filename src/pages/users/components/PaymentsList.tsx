import React from 'react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatDateTime } from '../../../utils/dateUtils';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  notes: string | null;
  created_at: string;
  record: {
    record_number: number;
    diagnosis: string;
    total_price: number;
    services: Array<{
      price: number;
      service: {
        base_service: {
          name_uz: string;
          name_ru: string;
        };
      };
    }>;
  };
}

interface PaymentsListProps {
  payments: Payment[];
  onRefresh: () => Promise<void>;
  onRecordClick: (record: any) => void;
}

export const PaymentsList: React.FC<PaymentsListProps> = ({ payments, onRecordClick }) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noPayments}
      </div>
    );
  }

  const getPaymentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cash: t.cash,
      card_transfer: t.cardTransfer,
      card: t.card
    };
    return types[type] || type;
  };

  const formatRecordNumber = (num: number) => {
    return String(num).padStart(6, '0');
  };

  // Calculate totals
  const totalRecordsPrice = payments.reduce((sum, payment) => 
    sum + (payment.record?.total_price || 0), 0);
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balance = totalPayments - totalRecordsPrice;

  return (
    <div>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Total Records Price:</span>
            <div className="text-lg font-bold text-red-600">
              {totalRecordsPrice.toLocaleString()} UZS
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Payments:</span>
            <div className="text-lg font-bold text-green-600">
              {totalPayments.toLocaleString()} UZS
            </div>
          </div>
          <div className="col-span-2">
            <span className="text-sm text-gray-600">Balance:</span>
            <div className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString()} UZS
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {payments.map((payment) => (
          <div key={payment.id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-green-600">
                  +{payment.amount.toLocaleString()} UZS
                </p>
                <p className="text-sm text-indigo-600">
                  {getPaymentTypeLabel(payment.payment_type)}
                </p>
                {payment.record && (
                  <div 
                    onClick={() => onRecordClick(payment.record)}
                    className="mt-1 cursor-pointer hover:bg-gray-50 rounded p-2 -ml-2 transition-colors inline-block"
                  >
                    <p className="text-sm text-gray-500">
                      Record #{formatRecordNumber(payment.record.record_number)}
                    </p>
                    <p className="text-sm font-medium text-red-600">
                      Record Price: {payment.record.total_price.toLocaleString()} UZS
                    </p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {formatDateTime(payment.created_at)}
                </p>
              </div>
            </div>
            {payment.notes && (
              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                {payment.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};