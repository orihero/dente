import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';
import { formatDateTime } from '../../../utils/dateUtils';

interface RequestDetailsModalProps {
  request: any;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  requestTypes: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  request,
  onClose,
  onUpdate,
  requestTypes
}) => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    status: request.status,
    admin_notes: request.admin_notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('dentist_requests')
        .update({
          status: data.status,
          admin_notes: data.admin_notes
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      await onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error updating request:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: language === 'uz' ? 'Kutilmoqda' : 'Ожидает' },
    { value: 'in_progress', label: language === 'uz' ? 'Jarayonda' : 'В процессе' },
    { value: 'resolved', label: language === 'uz' ? 'Hal qilindi' : 'Решено' },
    { value: 'rejected', label: language === 'uz' ? 'Rad etildi' : 'Отклонено' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-semibold">
              {language === 'uz' ? 'So\'rov tafsilotlari' : 'Детали запроса'}
            </h2>
            <p className="text-sm text-gray-500">
              {formatDateTime(request.created_at)}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Dentist Info */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {language === 'uz' ? 'Shifokor ma\'lumotlari' : 'Информация о враче'}
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-900">{request.dentist.full_name}</p>
              <p className="text-gray-600">{request.dentist.email}</p>
              <p className="text-gray-600">{request.dentist.phone}</p>
              {request.dentist.clinic && (
                <p className="text-gray-600 mt-1">
                  {language === 'uz' 
                    ? request.dentist.clinic.name_uz 
                    : request.dentist.clinic.name_ru}
                </p>
              )}
            </div>
          </div>

          {/* Request Type */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {language === 'uz' ? 'So\'rov turi' : 'Тип запроса'}
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-900">
                {requestTypes.find(t => t.value === request.type)?.label || request.type}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {requestTypes.find(t => t.value === request.type)?.description}
              </p>
            </div>
          </div>

          {/* Request Description */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {language === 'uz' ? 'So\'rov mazmuni' : 'Содержание запроса'}
            </h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'uz' ? 'Holat' : 'Статус'}
              </label>
              <select
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'uz' ? 'Admin izohi' : 'Примечание администратора'}
              </label>
              <textarea
                value={data.admin_notes}
                onChange={(e) => setData({ ...data, admin_notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={language === 'uz'
                  ? 'So\'rov bo\'yicha izoh yoki qaror...'
                  : 'Комментарий или решение по запросу...'
                }
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading 
                  ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                  : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};