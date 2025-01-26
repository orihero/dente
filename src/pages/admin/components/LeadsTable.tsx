import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { formatDateTime } from '../../../utils/dateUtils';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { LeadDetailsModal } from './LeadDetailsModal';

export const LeadsTable: React.FC = () => {
  const { language } = useLanguageStore();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          dentist:dentists(full_name),
          comments:lead_comments(
            id,
            content,
            created_at,
            dentist:dentists(full_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error: any) {
      console.error('Error fetching leads:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      await fetchLeads();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

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
        <AlertCircle className="w-5 h-5" />
        <p>{error}</p>
      </div>
    );
  }

  const statusLabels = {
    new: {
      uz: 'Yangi',
      ru: 'Новый',
      color: 'bg-blue-100 text-blue-800'
    },
    contacted: {
      uz: 'Bog\'lanildi',
      ru: 'Связались',
      color: 'bg-yellow-100 text-yellow-800'
    },
    converted: {
      uz: 'Ro\'yxatdan o\'tdi',
      ru: 'Зарегистрирован',
      color: 'bg-green-100 text-green-800'
    },
    rejected: {
      uz: 'Rad etildi',
      ru: 'Отклонен',
      color: 'bg-red-100 text-red-800'
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {language === 'uz' ? 'So\'rovlar' : 'Заявки'}
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Ism' : 'Имя'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Telefon' : 'Телефон'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Sana' : 'Дата'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Holat' : 'Статус'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Yo\'llagan shifokor' : 'Направивший врач'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Izohlar' : 'Комментарии'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDateTime(lead.created_at)}
                    </div>
                    {lead.appointment_time && (
                      <div className="text-xs text-gray-500 mt-1">
                        {language === 'uz' ? 'Qo\'ng\'iroq vaqti: ' : 'Время звонка: '}
                        {formatDateTime(lead.appointment_time)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`text-sm font-medium rounded-full px-2.5 py-0.5 ${
                        statusLabels[lead.status as keyof typeof statusLabels].color
                      }`}
                    >
                      {Object.entries(statusLabels).map(([value, labels]) => (
                        <option key={value} value={value}>
                          {labels[language as keyof typeof labels]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.dentist?.full_name || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">
                        {lead.comments?.length || 0}
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailsModal
        showModal={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onUpdate={fetchLeads}
      />
    </div>
  );
};