import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { formatDateTime } from '../../../utils/dateUtils';
import { RequestDetailsModal } from './RequestDetailsModal';

export const RequestsTable: React.FC = () => {
  const { language } = useLanguageStore();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('dentist_requests')
        .select(`
          *,
          dentist:dentists(
            id,
            full_name,
            email,
            phone,
            clinic:clinics(
              id,
              name_uz,
              name_ru
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, length: number = 100) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: {
        uz: 'Kutilmoqda',
        ru: 'Ожидает'
      },
      in_progress: {
        uz: 'Jarayonda',
        ru: 'В процессе'
      },
      resolved: {
        uz: 'Hal qilindi',
        ru: 'Решено'
      },
      rejected: {
        uz: 'Rad etildi',
        ru: 'Отклонено'
      }
    };

    return labels[status as keyof typeof labels]?.[language as keyof typeof labels.pending] || status;
  };

  const requestTypes = [
    {
      value: 'feature',
      label: language === 'uz' ? 'Yangi funksiya' : 'Новая функция',
      description: language === 'uz'
        ? 'Yangi funksiya qo\'shish yoki mavjud funksiyani yaxshilash bo\'yicha taklif'
        : 'Предложение по добавлению новой функции или улучшению существующей'
    },
    {
      value: 'bug',
      label: language === 'uz' ? 'Xatolik' : 'Ошибка',
      description: language === 'uz'
        ? 'Tizimda aniqlangan xatolik yoki nosozlik haqida xabar'
        : 'Сообщение об обнаруженной ошибке или неисправности в системе'
    },
    {
      value: 'suggestion',
      label: language === 'uz' ? 'Taklif' : 'Предложение',
      description: language === 'uz'
        ? 'Tizimni yaxshilash bo\'yicha umumiy taklif yoki fikr'
        : 'Общее предложение или идея по улучшению системы'
    },
    {
      value: 'support',
      label: language === 'uz' ? 'Yordam' : 'Поддержка',
      description: language === 'uz'
        ? 'Texnik yordam yoki maslahat olish uchun so\'rov'
        : 'Запрос на техническую поддержку или консультацию'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {language === 'uz' ? 'Tizim so\'rovlari' : 'Системные запросы'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Shifokor' : 'Врач'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Klinika' : 'Клиника'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'So\'rov turi' : 'Тип запроса'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'So\'rov' : 'Запрос'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Sana' : 'Дата'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Holat' : 'Статус'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr 
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.dentist.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.dentist.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.dentist.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {language === 'uz' 
                        ? request.dentist.clinic?.name_uz 
                        : request.dentist.clinic?.name_ru}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {requestTypes.find(t => t.value === request.type)?.label || request.type}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {truncateText(request.description)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(request.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdate={fetchRequests}
          requestTypes={requestTypes}
        />
      )}
    </div>
  );
};