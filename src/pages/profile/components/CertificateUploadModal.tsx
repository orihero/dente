import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';

interface CertificateUploadModalProps {
  showModal: boolean;
  onClose: () => void;
  onUpload: () => Promise<void>;
  loading: boolean;
}

export const CertificateUploadModal: React.FC<CertificateUploadModalProps> = ({
  showModal,
  onClose,
  onUpload,
  loading: externalLoading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [data, setData] = useState({
    title: '',
    issue_date: '',
    file: null as File | null
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!showModal) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Reset error when new file is selected
      setError(null);
      setData({ ...data, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Validate file size (max 5MB)
      if (data.file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(data.file.type)) {
        throw new Error('File must be JPEG, PNG, or WebP');
      }

      // Upload image
      const fileExt = data.file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(filePath, data.file, {
          upsert: false,
          contentType: data.file.type,
          cacheControl: '3600',
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('certificates')
        .getPublicUrl(filePath);

      // Create certificate record
      const { error: dbError } = await supabase
        .from('dentist_certificates')
        .insert({
          dentist_id: user.id,
          title: data.title,
          image_url: publicUrl,
          issue_date: data.issue_date
        });

      if (dbError) throw dbError;

      await onUpload();
      onClose();
      setData({
        title: '',
        issue_date: '',
        file: null
      });
    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      setError(error.message || 'Failed to upload certificate');
    } finally {
      setIsUploading(false);
    }
  };

  const isLoading = isUploading || externalLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.uploadCertificate}</h2>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              required
              disabled={isLoading}
              value={data.issue_date}
              onChange={(e) => setData({ ...data, issue_date: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Image
            </label>
            <input
              type="file"
              required
              disabled={isLoading}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full disabled:opacity-50"
            />
            <p className="mt-1 text-sm text-gray-500">
              Max file size: 5MB. Supported formats: JPEG, PNG, WebP
            </p>
          </div>

          {uploadProgress > 0 && (
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-600">
                  {Math.round(uploadProgress)}% Complete
                </span>
              </div>
              <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading || !data.file}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isLoading ? 'Uploading...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};