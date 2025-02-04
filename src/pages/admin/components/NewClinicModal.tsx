import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { supabase } from '../../../lib/supabase';
import { LogoUpload } from './clinic-form/LogoUpload';
import { LocationInfo } from './clinic-form/LocationInfo';
import { WorkingHours } from './clinic-form/WorkingHours';
import { ContactInfo } from './clinic-form/ContactInfo';

interface NewClinicModalProps {
  showModal: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  clinic?: any;
}

export const NewClinicModal: React.FC<NewClinicModalProps> = ({
  showModal,
  onClose,
  onSuccess,
  clinic
}) => {
  const { language } = useLanguageStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(clinic?.logo_url || '');
  const [data, setData] = useState({
    name: clinic?.name_uz || '',
    city: clinic?.city_uz || '',
    district: clinic?.district_uz || '',
    address: clinic?.address_uz || '',
    description: clinic?.description_uz || '',
    working_hours: clinic?.working_hours || {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: null
    },
    phone_numbers: clinic?.phone_numbers || [''],
    emails: clinic?.emails || [''],
    website: clinic?.website || '',
    social_media: clinic?.social_media || {
      instagram: '',
      facebook: '',
      telegram: ''
    },
    subscription_type: clinic?.subscription_type || 'small',
    geo_location: clinic?.geo_location ? {
      lat: clinic.geo_location.x,
      lng: clinic.geo_location.y
    } : { lat: 0, lng: 0 },
    logo_url: clinic?.logo_url || ''
  });

  if (!showModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format geo_location for PostGIS point type
      const point = `(${data.geo_location.lng},${data.geo_location.lat})`;

      // Filter out empty values from arrays
      const phone_numbers = data.phone_numbers.filter(Boolean);
      const emails = data.emails.filter(Boolean);

      const clinicData = {
        name_uz: data.name,
        name_ru: data.name,
        city_uz: data.city,
        city_ru: data.city,
        district_uz: data.district,
        district_ru: data.district,
        address_uz: data.address,
        address_ru: data.address,
        description_uz: data.description,
        description_ru: data.description,
        working_hours: data.working_hours,
        phone_numbers,
        emails,
        website: data.website,
        social_media: data.social_media,
        subscription_type: data.subscription_type,
        geo_location: point,
        logo_url: data.logo_url
      };

      if (clinic) {
        // Update existing clinic
        const { error: updateError } = await supabase
          .from('clinics')
          .update(clinicData)
          .eq('id', clinic.id);

        if (updateError) throw updateError;
      } else {
        // Create new clinic
        const { error: createError } = await supabase
          .from('clinics')
          .insert(clinicData);

        if (createError) throw createError;
      }

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving clinic:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">
            {clinic 
              ? (language === 'uz' ? 'Klinikani tahrirlash' : 'Редактировать клинику')
              : (language === 'uz' ? 'Yangi klinika' : 'Новая клиника')
            }
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'uz' ? 'Nomi' : 'Название'}
            </label>
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <LogoUpload
            previewUrl={previewUrl}
            onLogoChange={(url) => {
              setPreviewUrl(url);
              setData({ ...data, logo_url: url });
            }}
            onError={setError}
          />

          <LocationInfo
            data={data}
            onChange={(updates) => setData({ ...data, ...updates })}
          />

          <WorkingHours
            workingHours={data.working_hours}
            onChange={(hours) => setData({ ...data, working_hours: hours })}
          />

          <ContactInfo
            phoneNumbers={data.phone_numbers}
            emails={data.emails}
            website={data.website}
            socialMedia={data.social_media}
            onChange={(updates) => setData({ ...data, ...updates })}
          />

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading 
                ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                : (language === 'uz' ? 'Saqlash' : 'Сохранить')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};