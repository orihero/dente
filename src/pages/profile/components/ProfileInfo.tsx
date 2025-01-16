import React from 'react';
import { User, Phone, Award, Link as LinkIcon, Edit2, Calendar } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

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

interface ProfileInfoProps {
  profile: Profile;
  onEdit: () => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ profile, onEdit }) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t.personalInfo}
        </h2>
        <button
          onClick={onEdit}
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
  );
};