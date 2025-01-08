import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Phone, Award, Link as LinkIcon,
  Edit2, LogOut, Plus
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

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  experience: number;
  social_media: {
    instagram?: string;
    linkedin?: string;
  };
}

interface Certificate {
  id: string;
  title: string;
  image_url: string;
  issue_date: string;
}

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [services, setServices] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadServices();
    loadCertificates();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
    }
  };

  const loadServices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

  const loadCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('dentist_certificates')
        .select('*')
        .eq('dentist_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error('Error loading certificates:', error);
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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {t.personalInfo}
              </h2>
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Edit2 className="w-5 h-5" />
                <span>{t.edit}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-3" />
                <span>{profile.full_name}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Award className="w-5 h-5 mr-3" />
                <span>{profile.experience} {t.experience}</span>
              </div>
              {(profile.social_media?.instagram || profile.social_media?.linkedin) && (
                <div className="flex items-center gap-4">
                  {profile.social_media?.instagram && (
                    <a
                      href={`https://instagram.com/${profile.social_media.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <LinkIcon className="w-5 h-5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {profile.social_media?.linkedin && (
                    <a
                      href={profile.social_media.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <LinkIcon className="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              )}
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t.services}
                </h3>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
                >
                  <Plus className="w-5 h-5" />
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