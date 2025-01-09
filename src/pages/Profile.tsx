import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Award, Link as LinkIcon,
  Edit2, LogOut, Settings, Calendar, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { ServiceConfigModal } from './profile/components/ServiceConfigModal';
import { ServicesList } from './profile/components/ServicesList';
import { ProfileEditModal } from './profile/components/ProfileEditModal';
import { CertificatesSection } from './profile/components/CertificatesSection';
import { CertificateUploadModal } from './profile/components/CertificateUploadModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { ProfileSkeleton } from './profile/components/ProfileSkeleton';

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
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-indigo-600">Dente.uz</h1>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t.personalInfo}
              </h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
              >
                <Edit2 className="w-5 h-5" />
                <span>{t.edit}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <User className="w-5 h-5 mr-3" />
                  <span>{profile.full_name || '—'}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>{profile.phone || '—'}</span>
                </div>

                {profile.birthdate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>
                      {new Date(profile.birthdate).toLocaleDateString(
                        language === 'uz' ? 'uz-UZ' : 'ru-RU'
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <Award className="w-5 h-5 mr-3" />
                  <span>
                    {profile.experience} {t.experience}
                  </span>
                </div>

                {profile.social_media?.platforms?.length > 0 && (
                  <div className="flex items-center gap-4 mt-4">
                    {profile.social_media.platforms.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600"
                      >
                        <LinkIcon className="w-5 h-5" />
                        <span>{social.platform}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <CertificatesSection
            certificates={certificates}
            onUpload={() => setShowCertificateModal(true)}
            onDelete={handleDeleteCertificate}
            loading={loading}
          />

          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t.services}
                </h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
                >
                  <Settings className="w-5 h-5" />
                  <span>{t.addService}</span>
                </button>
              </div>

              <ServicesList services={services} />
            </div>
          </div>
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

export default Profile;