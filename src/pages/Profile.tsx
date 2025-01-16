import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { ServiceConfigModal } from './profile/components/ServiceConfigModal';
import { ServicesList } from './profile/components/ServicesList';
import { ProfileEditModal } from './profile/components/ProfileEditModal';
import { CertificatesSection } from './profile/components/CertificatesSection';
import { CertificateUploadModal } from './profile/components/CertificateUploadModal';
import { TelegramBotSettings } from './profile/components/TelegramBotSettings';
import { LoyaltyProgramsSection } from './profile/components/LoyaltyProgramsSection';
import { ReferralSection } from './profile/components/ReferralSection';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProfileSkeleton } from './profile/components/ProfileSkeleton';
import { ProfileHeader } from './profile/components/ProfileHeader';
import { ProfileInfo } from './profile/components/ProfileInfo';
import { ProfileServices } from './profile/components/ProfileServices';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  experience: number;
  birthdate: string | null;
  photo_url: string | null;
  social_media: {
    platforms: Array<{
      platform: string;
      url: string;
    }>;
  };
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchServices();
    fetchCertificates();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('dentists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      if (!user) return;

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
              name_ru
            )
          )
        `)
        .eq('dentist_id', user.id)
        .order('created_at');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const fetchCertificates = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('dentist_certificates')
        .select('*')
        .eq('dentist_id', user.id)
        .order('created_at');

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await fetchProfile();
      await fetchServices();
      await fetchCertificates();
      setShowEditModal(false);
      setShowServiceModal(false);
      setShowCertificateModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!window.confirm(t.confirmLogout)) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('dentist_certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            {language === 'uz' ? 'Profil topilmadi' : 'Профиль не найден'}
          </h2>
          <button
            onClick={handleSignOut}
            className="text-indigo-600 hover:text-indigo-500"
          >
            {t.logout}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader onSignOut={handleSignOut} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ProfileInfo
            profile={profile}
            onEdit={() => setShowEditModal(true)}
          />

          <CertificatesSection
            certificates={certificates}
            onUpload={() => setShowCertificateModal(true)}
            onDelete={handleDeleteCertificate}
            loading={loading}
          />

          <LoyaltyProgramsSection
            dentistId={profile.id}
            onRefresh={handleUpdateProfile}
          />

          <ReferralSection
            dentistId={profile.id}
            onRefresh={handleUpdateProfile}
          />

          <TelegramBotSettings
            dentistId={profile.id}
            onRefresh={handleUpdateProfile}
          />

          <ProfileServices
            services={services}
            onAddService={() => setShowServiceModal(true)}
          />
        </div>
      </div>

      <BottomNavigation />

      <ProfileEditModal
        showModal={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProfile}
        loading={loading}
        profile={profile}
      />

      <ServiceConfigModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmit={handleUpdateProfile}
        loading={loading}
      />

      <CertificateUploadModal
        showModal={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onUpload={handleUpdateProfile}
        loading={loading}
      />
    </div>
  );
};