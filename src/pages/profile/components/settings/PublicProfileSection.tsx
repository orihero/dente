import React, { useState } from 'react';
import { Globe, Copy, ExternalLink } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface PublicProfileSectionProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const PublicProfileSection: React.FC<PublicProfileSectionProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const [copied, setCopied] = useState(false);

  const publicProfileUrl = `${window.location.origin}/shifokor/${dentistId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicProfileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleOpenLink = () => {
    window.open(publicProfileUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-indigo-600" />
        <h3 className="font-medium text-gray-900">
          {language === 'uz' ? 'Ommaviy profil' : 'Публичный профиль'}
        </h3>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">
          {language === 'uz' ? 'Sizning ommaviy profil havolangiz' : 'Ваша публичная ссылка на профиль'}
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={publicProfileUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-white"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>
              {copied 
                ? (language === 'uz' ? 'Nusxalandi!' : 'Скопировано!')
                : (language === 'uz' ? 'Nusxalash' : 'Копировать')}
            </span>
          </button>
          <button
            onClick={handleOpenLink}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>
              {language === 'uz' ? 'Ko\'rish' : 'Просмотр'}
            </span>
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'uz'
            ? 'Bu havola orqali bemorlar sizning profilingizni ko\'rishlari va qabulga yozilishlari mumkin'
            : 'По этой ссылке пациенты могут просмотреть ваш профиль и записаться на приём'}
        </p>
      </div>
    </div>
  );
};