import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { supabase } from '../../../../lib/supabase';

interface LogoUploadProps {
  previewUrl: string;
  onLogoChange: (url: string) => void;
  onError: (error: string) => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  previewUrl,
  onLogoChange,
  onError
}) => {
  const { language } = useLanguageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 2 * 1024 * 1024) {
        onError('File size must be less than 2MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        onError('File must be JPEG, PNG, or WebP');
        return;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `clinics/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('clinic-logos')
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type,
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('clinic-logos')
          .getPublicUrl(filePath);

        onLogoChange(publicUrl);
      } catch (error: any) {
        console.error('Error uploading logo:', error);
        onError(error.message);
      }
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {language === 'uz' ? 'Logotip' : 'Логотип'}
      </label>
      <div className="flex items-center gap-4">
        <div 
          className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-8 h-8 text-gray-400" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleLogoSelect}
          className="hidden"
        />
        <div className="text-sm text-gray-500">
          <p className="font-medium">
            {language === 'uz' ? 'Logotipni yuklang' : 'Загрузите логотип'}
          </p>
          <p className="mt-1">PNG, JPG, WebP • Max 2MB</p>
        </div>
      </div>
    </div>
  );
};