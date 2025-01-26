import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';

interface ContactInfoProps {
  phoneNumbers: string[];
  emails: string[];
  website: string;
  socialMedia: {
    instagram: string;
    facebook: string;
    telegram: string;
  };
  onChange: (data: {
    phoneNumbers?: string[];
    emails?: string[];
    website?: string;
    socialMedia?: {
      instagram: string;
      facebook: string;
      telegram: string;
    };
  }) => void;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  phoneNumbers,
  emails,
  website,
  socialMedia,
  onChange
}) => {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">
        {language === 'uz' ? 'Aloqa ma\'lumotlari' : 'Контактная информация'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Telefon raqamlar' : 'Номера телефонов'}
          </label>
          {phoneNumbers.map((phone, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const newPhones = [...phoneNumbers];
                  newPhones[index] = e.target.value;
                  onChange({ phoneNumbers: newPhones });
                }}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {index === phoneNumbers.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onChange({ phoneNumbers: [...phoneNumbers, ''] })}
                  className="px-3 py-2 text-indigo-600 hover:text-indigo-500"
                >
                  +
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const newPhones = phoneNumbers.filter((_, i) => i !== index);
                    onChange({ phoneNumbers: newPhones });
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmails = [...emails];
                  newEmails[index] = e.target.value;
                  onChange({ emails: newEmails });
                }}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {index === emails.length - 1 ? (
                <button
                  type="button"
                  onClick={() => onChange({ emails: [...emails, ''] })}
                  className="px-3 py-2 text-indigo-600 hover:text-indigo-500"
                >
                  +
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const newEmails = emails.filter((_, i) => i !== index);
                    onChange({ emails: newEmails });
                  }}
                  className="px-3 py-2 text-red-600 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => onChange({ website: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram
            </label>
            <input
              type="text"
              value={socialMedia.instagram}
              onChange={(e) => onChange({
                socialMedia: { ...socialMedia, instagram: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook
            </label>
            <input
              type="text"
              value={socialMedia.facebook}
              onChange={(e) => onChange({
                socialMedia: { ...socialMedia, facebook: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telegram
            </label>
            <input
              type="text"
              value={socialMedia.telegram}
              onChange={(e) => onChange({
                socialMedia: { ...socialMedia, telegram: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};