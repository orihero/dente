import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Calendar, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DemoBookingModal } from '../components/landing/DemoBookingModal';
import { useLanguageStore } from '../store/languageStore';

export const DentistProfile: React.FC = () => {
  const { id } = useParams();
  const { language } = useLanguageStore();
  const [dentist, setDentist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    fetchDentist();
  }, [id]);

  const fetchDentist = async () => {
    try {
      const { data, error } = await supabase
        .from('dentists')
        .select(`
          *,
          clinic:clinics(
            id,
            name_uz,
            name_ru,
            city_uz,
            city_ru,
            district_uz,
            district_ru,
            address_uz,
            address_ru,
            phone_numbers,
            emails,
            website,
            geo_location
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setDentist(data);
    } catch (error: any) {
      console.error('Error fetching dentist:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const t = {
    uz: {
      notFound: 'Shifokor topilmadi',
      notFoundDesc: 'Kechirasiz, so\'ralgan shifokor topilmadi yoki mavjud emas.',
      experience: 'yillik tajriba',
      contact: 'Bog\'lanish',
      socialMedia: 'Ijtimoiy tarmoqlar',
      location: 'Joylashuv',
      viewLargerMap: 'Kattaroq xaritada ko\'rish',
      bookAppointment: 'Qabulga yozilish'
    },
    ru: {
      notFound: 'Врач не найден',
      notFoundDesc: 'Извините, запрашиваемый врач не найден или не существует.',
      experience: 'лет опыта',
      contact: 'Контакты',
      socialMedia: 'Социальные сети',
      location: 'Расположение',
      viewLargerMap: 'Посмотреть на большой карте',
      bookAppointment: 'Записаться на приём'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !dentist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t[language].notFound}
          </h1>
          <p className="text-gray-600">
            {t[language].notFoundDesc}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {dentist.photo_url ? (
              <img
                src={dentist.photo_url}
                alt={dentist.full_name}
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full mx-auto mb-6 bg-indigo-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-indigo-600">
                  {dentist.full_name.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {dentist.full_name}
            </h1>
            <p className="text-xl text-gray-600">
              {dentist.experience} {t[language].experience}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t[language].contact}
              </h2>
              {dentist.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <a href={`tel:${dentist.phone}`} className="text-gray-600 hover:text-indigo-600">
                    {dentist.phone}
                  </a>
                </div>
              )}
              {dentist.clinic?.emails?.[0] && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <a href={`mailto:${dentist.clinic.emails[0]}`} className="text-gray-600 hover:text-indigo-600">
                    {dentist.clinic.emails[0]}
                  </a>
                </div>
              )}
              {dentist.clinic?.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <a href={dentist.clinic.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600">
                    {dentist.clinic.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {dentist.clinic && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                  <div>
                    <p className="text-gray-600">
                      {language === 'uz' ? dentist.clinic.name_uz : dentist.clinic.name_ru}
                    </p>
                    <p className="text-gray-600">
                      {language === 'uz' ? dentist.clinic.address_uz : dentist.clinic.address_ru}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {dentist.social_media?.platforms?.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t[language].socialMedia}
                </h2>
                <div className="space-y-4">
                  {dentist.social_media.platforms.map((platform: any, index: number) => (
                    <a
                      key={index}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-600 hover:text-indigo-600"
                    >
                      <Globe className="w-5 h-5" />
                      <span>{platform.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          {dentist.clinic?.geo_location && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t[language].location}
              </h2>
              <div className="h-96 bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  title="Clinic Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    dentist.clinic.geo_location.x - 0.002
                  }%2C${
                    dentist.clinic.geo_location.y - 0.002
                  }%2C${
                    dentist.clinic.geo_location.x + 0.002
                  }%2C${
                    dentist.clinic.geo_location.y + 0.002
                  }&layer=mapnik&marker=${dentist.clinic.geo_location.y}%2C${dentist.clinic.geo_location.x}`}
                />
                <div className="mt-2">
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${dentist.clinic.geo_location.y}&mlon=${dentist.clinic.geo_location.x}#map=17/${dentist.clinic.geo_location.y}/${dentist.clinic.geo_location.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {t[language].viewLargerMap}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Book Appointment Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>{t[language].bookAppointment}</span>
            </button>
          </div>
        </div>
      </div>

      <DemoBookingModal
        showModal={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        referredBy={id}
      />
    </div>
  );
};