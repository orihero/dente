import React from 'react';
import { FileText, Clock, Shield } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatDateTime } from '../../../utils/dateUtils';

interface Record {
  id: string;
  record_number: number;
  diagnosis: string;
  total_price: number;
  created_at: string;
  services: Array<{
    price: number;
    service: {
      base_service: {
        name_uz: string;
        name_ru: string;
      };
      duration: string;
      warranty_months: number;
    };
  }>;
}

interface RecordsListProps {
  records: Record[];
  onRefresh: () => Promise<void>;
  onRecordClick: (record: Record) => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({ records, onRecordClick }) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No records found
      </div>
    );
  }

  const formatRecordNumber = (num: number) => {
    return String(num).padStart(6, '0');
  };

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <div 
          key={record.id} 
          onClick={() => onRecordClick(record)}
          className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-indigo-300 transition-colors"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Record #{formatRecordNumber(record.record_number)}
              </h3>
              <p className="text-sm text-gray-500">
                {formatDateTime(record.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-red-600">
                {record.total_price.toLocaleString()} UZS
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-gray-700">{record.diagnosis}</p>
          </div>

          <div className="space-y-3">
            {record.services.map((service, index) => (
              <div key={index} className="flex justify-between items-start border-t pt-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {language === 'uz' 
                      ? service.service.base_service.name_uz 
                      : service.service.base_service.name_ru}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.service.duration}</span>
                    </div>
                    {service.service.warranty_months > 0 && (
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        <span>{service.service.warranty_months} months</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  {service.price.toLocaleString()} UZS
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};