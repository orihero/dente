import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../store/profileStore';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { BottomNavigation } from '../components/BottomNavigation';
import { Header } from '../components/Header';
import { ProfileInfo } from './profile/components/ProfileInfo';
import { CertificatesSection } from './profile/components/CertificatesSection';
import { ReferralSection } from './profile/components/ReferralSection';
import { ProfileServices } from './profile/components/ProfileServices';
import { ProfileEditModal } from './profile/components/ProfileEditModal';
import { ServiceConfigModal } from './profile/components/ServiceConfigModal';
import { CertificateUploadModal } from './profile/components/CertificateUploadModal';
import { NewProfileForm } from './profile/components/NewProfileForm';
import { SettingsSection } from './profile/components/SettingsSection';
import { supabase } from '../lib/supabase';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { profile, loading, error, fetchProfile, updateProfile } = useProfileStore();
  const t = translations[language].profile;
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [services, setServices] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
      fetchServices();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('dentist_certificates')
        .select('*')
        .eq('dentist_id', profile.id)
        .order('created_at');

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('dentist_services')
        .select(`
          *,
          base_service:base_services(
            id,
            name_uz,
            name_ru,
            category:service_categories(
              id,
              name_uz,
              name_ru,
              color
            )
          )
        `)
        .eq('dentist_id', profile.id)
        .order('created_at');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dentist_certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {language === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchProfile()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            {language === 'uz' ? 'Qayta urinish' : 'Повторить попытку'}
          </button>
        </div>
      </div>
    );
  }

  // Check if profile is incomplete
  const isProfileIncomplete = !profile || !profile.full_name || !profile.phone;

  if (isProfileIncomplete) {
    return <NewProfileForm updateProfile={updateProfile} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProfileInfo
            profile={profile}
            onEdit={() => setShowEditModal(true)}
          />

          <CertificatesSection
            certificates={certificates}
            onUpload={() => setShowCertificateModal(true)}
            onDelete={handleDeleteCertificate}
            loading={modalLoading}
          />

          <ReferralSection
            dentistId={profile.id}
            onRefresh={fetchProfile}
          />

          <ProfileServices
            services={services}
            onAddService={() => setShowServiceModal(true)}
          />

          <SettingsSection
            dentistId={profile.id}
            onRefresh={fetchProfile}
          />
        </div>
      </div>

      <BottomNavigation />

      <ProfileEditModal
        showModal={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={async (data) => {
          setModalLoading(true);
          await updateProfile(data);
          setShowEditModal(false);
          setModalLoading(false);
        }}
        loading={modalLoading}
        profile={profile}
      />

      <ServiceConfigModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmit={async () => {
          await fetchServices();
          setShowServiceModal(false);
        }}
        loading={modalLoading}
      />

      <CertificateUploadModal
        showModal={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onUpload={async () => {
          await fetchCertificates();
          setShowCertificateModal(false);
        }}
        loading={modalLoading}
      />
    </div>
  );
};