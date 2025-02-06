import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { DatePicker } from '../../../components/DatePicker';
import { PhoneInput } from '../../../components/PhoneInput';
import { supabase } from '../../../lib/supabase';

interface ProfileEditModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  profile: any;
}

interface SocialMedia {
  platform: string;
  url: string;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  profile
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState({
    full_name: '',
    phone: '',
    birthdate: '',
    photo_url: '',
    social_media: [] as SocialMedia[]
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        birthdate: profile.birthdate || '',
        photo_url: profile.photo_url || '',
        social_media: profile.social_media?.platforms || []
      });
      setPreviewUrl(profile.photo_url || '');
    }
  }, [profile]);

  if (!showModal) return null;

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('File must be JPEG, PNG, or WebP');
        return;
      }

      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPreviewUrl('');
    setData({ ...data, photo_url: '' });
  };

  const handleAddSocial = () => {
    setData({
      ...data,
      social_media: [...data.social_media, { platform: '', url: '' }]
    });
  };

  const handleRemoveSocial = (index: number) => {
    setData({
      ...data,
      social_media: data.social_media.filter((_, i) => i !== index)
    });
  };

  const handleUpdateSocial = (index: number, field: 'platform' | 'url', value: string) => {
    const newSocialMedia = [...data.social_media];
    newSocialMedia[index] = { ...newSocialMedia[index], [field]: value };
    setData({ ...data, social_media: newSocialMedia });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let photoUrl = data.photo_url;

      // Upload new photo if selected
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, photoFile, {
            upsert: true,
            contentType: photoFile.type,
            cacheControl: '3600',
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100);
            }
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('dentists')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          birthdate: data.birthdate || null,
          photo_url: photoUrl,
          social_media: { platforms: data.social_media }
        })
        .eq('id', user.id);

      if (error) throw error;
      await onSubmit();
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{t.edit}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <Upload className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-indigo-600">
                    {Math.round(uploadProgress)}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={data.full_name}
                onChange={(e) => setData({ ...data, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.phone}
              </label>
              <PhoneInput
                value={data.phone}
                onChange={(value) => setData({ ...data, phone: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "uz" ? "Tug`ilgan sana" : "Дата рождения"}
              </label>
              <DatePicker
                value={data.birthdate}
                onChange={(value) => setData({ ...data, birthdate: value })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === "uz" ? "Ijtimoiy tarmoqlar" : "Социальные сети"}
              </label>
              <button
                type="button"
                onClick={handleAddSocial}
                className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {language === "uz" ? "Platforma qo`shish" : "Добавить платформу"}
              </button>
            </div>
            <div className="space-y-3">
              {data.social_media.map((social, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder={language === "uz" ? "Platforma nomi" : "Название платформы"}
                    value={social.platform}
                    onChange={(e) => handleUpdateSocial(index, 'platform', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="url"
                    placeholder={language === "uz" ? "Havola" : "Ссылка"}
                    value={social.url}
                    onChange={(e) => handleUpdateSocial(index, 'url', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading || isUploading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};