import React, { useState } from 'react';
import { Clock, Shield, Send } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { FilesList } from './FilesList';
import { SendRecipeModal } from './SendRecipeModal';

interface ViewDetailsProps {
  record: any;
  onRefresh: () => Promise<void>;
}

export const ViewDetails: React.FC<ViewDetailsProps> = ({
  record,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [showSendRecipeModal, setShowSendRecipeModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {language === 'uz' ? 'Tashxis' : 'Диагноз'}
        </h3>
        <p className="text-gray-900">{record.diagnosis}</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">
          {language === 'uz' ? 'Xizmatlar' : 'Услуги'}
        </h3>
        {record.services.map((service: any, index: number) => (
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
        <div className="flex justify-between items-center pt-4 border-t">
          <span className="font-medium text-gray-900">
            {language === 'uz' ? 'Umumiy narx' : 'Общая цена'}:
          </span>
          <span className="text-lg font-bold text-red-600">
            {record.total_price.toLocaleString()} UZS
          </span>
        </div>
      </div>

      {record.files?.length > 0 && (
        <FilesList files={record.files} />
      )}

      {(record.recipe || record.suggestions) && (
        <div className="space-y-4 border-t pt-4">
          {record.recipe && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {language === 'uz' ? 'Dori-darmonlar' : 'Лекарства'}
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{record.recipe}</p>
            </div>
          )}

          {record.suggestions && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                {language === 'uz' ? 'Tavsiyalar' : 'Рекомендации'}
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{record.suggestions}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setShowSendRecipeModal(true)}
        disabled={record.recipe_sent}
        className={`flex items-center gap-2 px-4 py-2 rounded-md ${
          record.recipe_sent
            ? 'bg-green-100 text-green-800 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        <Send className="w-4 h-4" />
        <span>
          {record.recipe_sent
            ? t.sent
            : t.sendRecipe}
        </span>
      </button>

      <SendRecipeModal
        showModal={showSendRecipeModal}
        onClose={() => setShowSendRecipeModal(false)}
        record={record}
        onSuccess={onRefresh}
      />
    </div>
  );
};