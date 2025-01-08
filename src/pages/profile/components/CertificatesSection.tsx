import React from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface Certificate {
  id: string;
  title: string;
  image_url: string;
  issue_date: string;
}

interface CertificatesSectionProps {
  certificates: Certificate[];
  onUpload: () => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  certificates,
  onUpload,
  onDelete,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;

  return (
    <div className="border-t border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t.certificates}
          </h3>
          <button
            onClick={onUpload}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
          >
            <Plus className="w-5 h-5" />
            <span>{t.uploadCertificate}</span>
          </button>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No certificates uploaded
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="group relative">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={cert.image_url}
                    alt={cert.title}
                    className="h-full w-full object-cover object-center"
                  />
                  <button
                    onClick={() => onDelete(cert.id)}
                    disabled={loading}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {cert.title}
                  </h4>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(cert.issue_date).toLocaleDateString(
                        language === 'uz' ? 'uz-UZ' : 'ru-RU'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};