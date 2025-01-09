import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Award, Link as LinkIcon,
  Edit2, LogOut, Settings, Calendar, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState([]);
  const [services, setServices] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    loadAuthUser();
    loadProfile();
    loadServices();
    loadCertificates();
  }, []);

  const loadAuthUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) throw new Error('No authenticated user found');
      setAuthUser(user);
    } catch (error) {
      console.error('Error loading auth user:', error);
      navigate('/login');
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      const { data, error } = await supabase
        .from('dentists')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error.message || error);
      if (error.message?.includes('auth')) {
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

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
    } catch (error: any) {
      console.error('Error loading services:', error.message || error);
    }
  };

  const loadCertificates = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('No authenticated user found');

      const { data, error } = await supabase
        .from('dentist_certificates')
        .select('*')
        .eq('dentist_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: any) {
      console.error('Error loading certificates:', error.message || error);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('dentist_certificates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t.confirmLogout)) {
      await supabase.auth.signOut();
      navigate('/login');
    }
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile || !authUser) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">{t.title}</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-indigo-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile.full_name}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-3" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-5 h-5 mr-3" />
                      <span>{authUser.email}</span>
                    </div>
                    {profile.birthdate && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3" />
                        <span>
                          {new Date(profile.birthdate).toLocaleDateString(
                            language === 'uz' ? 'uz-UZ' : 'ru-RU',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                          {' • '}
                          {calculateAge(profile.birthdate)} {language === 'uz' ? 'yosh' : 'лет'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Award className="w-5 h-5 mr-3" />
                      <span>
                        {profile.experience} {language === 'uz' ? 'yillik tajriba' : 'лет опыта'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-5 h-5" />
                <span>{t.edit}</span>
              </button>
            </div>

            {profile.social_media?.platforms?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {profile.social_media.platforms.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span>{social.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <CertificatesSection
            certificates={certificates}
            onUpload={() => setShowCertificateModal(true)}
            onDelete={handleDeleteCertificate}
            loading={loading}
          />

          <div className="border-t border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t.services}
                </h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
                >
                  <Settings className="w-5 h-5" />
                  <span>{language === 'uz' ? 'Xizmatlarni sozlash' : 'Настроить услуги'}</span>
                </button>
              </div>
              <ServicesList services={services} />
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />

      <ProfileEditModal
        showModal={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={loadProfile}
        loading={loading}
        profile={profile}
      />

      <ServiceConfigModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onSubmit={loadServices}
        loading={loading}
      />

      <CertificateUploadModal
        showModal={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onUpload={loadCertificates}
        loading={loading}
      />
    </div>
  );
};

export default Profile;