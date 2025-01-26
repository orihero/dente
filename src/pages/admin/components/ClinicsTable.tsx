import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { NewClinicModal } from './NewClinicModal';
import { ClinicGrid } from './clinic-list/ClinicGrid';

export const ClinicsTable: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
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
        .select('*')
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

  const handleEditClinic = (clinic: any) => {
    setSelectedClinic(clinic);
    setShowModal(true);
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

        <ClinicGrid
          clinics={clinics}
          onEditClinic={handleEditClinic}
        />
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