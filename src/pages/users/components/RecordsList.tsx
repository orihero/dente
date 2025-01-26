import React, { useState } from 'react';
import { FileText, Clock, Shield, Send } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { formatDateTime } from '../../../utils/dateUtils';
import { SendRecipeModal } from './record-details/SendRecipeModal';

interface Record {
  id: string;
  record_number: number;
  diagnosis: string;
  total_price: number;
  created_at: string;
  recipe?: string;
  suggestions?: string;
  recipe_sent?: boolean;
  services: Array<{
    price: number;
    service: {
      base_service: {
        name_uz: string;
        name_ru: string;
      };
      duration: string;
      warranty: string;
    };
  }>;
}

interface RecordsListProps {
  records: Record[];
  onRefresh: () => Promise<void>;
  onRecordClick: (record: Record) => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({ 
  records, 
  onRefresh, 
  onRecordClick 
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'uz' ? 'Yozuvlar mavjud emas' : 'Нет записей'}
      </div>
    );
  }

  const formatRecordNumber = (num: number) => {
    return String(num).padStart(6, '0');
  };

  return (
    <>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent record click
                    setSelectedRecord(record);
                    setShowRecipeModal(true);
                  }}
                  disabled={record.recipe_sent}
                  className={`mt-2 flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    record.recipe_sent
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>
                    {record.recipe_sent ? t.sent : t.sendRecipe}
                  </span>
                </button>
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
                      {service.service.warranty && (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span>{service.service.warranty}</span>
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

      {selectedRecord && (
        <SendRecipeModal
          showModal={showRecipeModal}
          onClose={() => {
            setShowRecipeModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
};