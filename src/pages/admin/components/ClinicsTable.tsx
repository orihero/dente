import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { NewClinicModal } from './NewClinicModal';
import { Switch } from '../../../components/Switch';

export const ClinicsTable: React.FC = () => {
  const { language } = useLanguageStore();
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select(`
          *,
          dentists:dentists(id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinics(data || []);
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (clinicId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ enabled })
        .eq('id', clinicId);

      if (error) throw error;
      await fetchClinics();
    } catch (error: any) {
      console.error('Error updating clinic status:', error);
      setError(error.message);
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
            {language === 'uz' ? 'Klinikalar' : 'Клиники'}
          </h2>
          <button
            onClick={() => {
              setSelectedClinic(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>
              {language === 'uz' ? 'Klinika qo\'shish' : 'Добавить клинику'}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Nomi' : 'Название'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Manzil' : 'Адрес'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Aloqa' : 'Контакты'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Shifokorlar' : 'Врачи'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Holat' : 'Статус'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Amal' : 'Действие'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clinics.map((clinic) => (
                <tr key={clinic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {clinic.logo_url && (
                        <img
                          src={clinic.logo_url}
                          alt={language === 'uz' ? clinic.name_uz : clinic.name_ru}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {language === 'uz' ? clinic.name_uz : clinic.name_ru}
                        </div>
                        {clinic.website && (
                          <a
                            href={clinic.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                          >
                            <Globe className="w-4 h-4" />
                            <span>{clinic.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {language === 'uz' ? clinic.city_uz : clinic.city_ru}
                      </div>
                      <div className="text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{language === 'uz' ? clinic.address_uz : clinic.address_ru}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm space-y-1">
                      {clinic.phone_numbers?.[0] && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-4 h-4" />
                          <span>{clinic.phone_numbers[0]}</span>
                        </div>
                      )}
                      {clinic.emails?.[0] && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Mail className="w-4 h-4" />
                          <span>{clinic.emails[0]}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {clinic.dentists?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Switch
                      checked={clinic.enabled || false}
                      onChange={(checked) => handleStatusChange(clinic.id, checked)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setShowModal(true);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {language === 'uz' ? 'Tahrirlash' : 'Редактировать'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewClinicModal
        showModal={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedClinic(null);
        }}
        onSuccess={fetchClinics}
        clinic={selectedClinic}
      />
    </div>
  );
};