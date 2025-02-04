import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Calendar, Building2, Edit2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { DentistModal } from './DentistModal';

export const DentistsTable: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [dentists, setDentists] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // First check if user is admin
      const { data: isAdmin } = await supabase.rpc('is_admin_dentist');
      if (!isAdmin) {
        throw new Error(language === 'uz' 
          ? 'Sizda ruxsat yo\'q'
          : 'У вас нет разрешения'
        );
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch dentists with clinic info
      const { data: dentistsData, error: dentistsError } = await supabase
        .from('dentists')
        .select(`
          *,
          clinic:clinics (
            id,
            name_uz,
            name_ru
          )
        `)
        .neq('id', user.id)
        .order('created_at', { ascending: false });

      if (dentistsError) throw dentistsError;

      // Fetch clinics
      const { data: clinicsData, error: clinicsError } = await supabase
        .from('clinics')
        .select('*')
        .order('name_uz');

      if (clinicsError) throw clinicsError;

      setDentists(dentistsData || []);
      setClinics(clinicsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDentist = async () => {
    try {
      await fetchData();
      setShowModal(false);
      setSelectedDentist(null);
    } catch (error) {
      console.error('Error saving dentist:', error);
    }
  };

  const handleClinicChange = async (dentistId: string, clinicId: string | null) => {
    try {
      const { error } = await supabase
        .from('dentists')
        .update({ clinic_id: clinicId })
        .eq('id', dentistId);

      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      console.error('Error updating clinic:', error);
      setError(error.message);
    }
  };

  const getSubscriptionStatus = (dentist: any) => {
    if (!dentist.subscription_ends_at) {
      return {
        label: language === 'uz' ? 'Faol emas' : 'Неактивный',
        color: 'bg-red-100 text-red-800'
      };
    }

    const endsAt = new Date(dentist.subscription_ends_at);
    const now = new Date();

    if (endsAt < now) {
      return {
        label: language === 'uz' ? 'Muddati tugagan' : 'Истёк',
        color: 'bg-red-100 text-red-800'
      };
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7) {
      return {
        label: `${daysRemaining} ${language === 'uz' ? 'kun qoldi' : 'дней осталось'}`,
        color: 'bg-yellow-100 text-yellow-800'
      };
    }

    return {
      label: language === 'uz' ? 'Faol' : 'Активный',
      color: 'bg-green-100 text-green-800'
    };
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
            {language === 'uz' ? 'Shifokorlar' : 'Врачи'}
          </h2>
          <button
            onClick={() => {
              setSelectedDentist(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>
              {language === 'uz' ? 'Shifokor qo\'shish' : 'Добавить врача'}
            </span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Ism' : 'Имя'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Email' : 'Email'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Telefon' : 'Телефон'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Klinika' : 'Клиника'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Obuna holati' : 'Статус подписки'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'uz' ? 'Amal' : 'Действие'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dentists.map((dentist) => {
                const status = getSubscriptionStatus(dentist);
                return (
                  <tr key={dentist.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {dentist.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dentist.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dentist.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <select
                          value={dentist.clinic_id || ''}
                          onChange={(e) => handleClinicChange(dentist.id, e.target.value || null)}
                          className="text-sm border-0 bg-transparent focus:ring-0"
                        >
                          <option value="">
                            {language === 'uz' ? 'Klinika tanlanmagan' : 'Клиника не выбрана'}
                          </option>
                          {clinics.map((clinic) => (
                            <option key={clinic.id} value={clinic.id}>
                              {language === 'uz' ? clinic.name_uz : clinic.name_ru}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      {dentist.subscription_ends_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          <Calendar className="w-3 h-3 inline-block mr-1" />
                          {new Date(dentist.subscription_ends_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedDentist(dentist);
                          setShowModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DentistModal
        showModal={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedDentist(null);
        }}
        onSubmit={handleSaveDentist}
        loading={loading}
        dentist={selectedDentist}
        clinics={clinics}
      />
    </div>
  );
};