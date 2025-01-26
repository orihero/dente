import React from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Star } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface ClinicCardProps {
  clinic: any;
  onEdit: () => void;
}

export const ClinicCard: React.FC<ClinicCardProps> = ({ clinic, onEdit }) => {
  const { language } = useLanguageStore();

  const getSubscriptionTypeLabel = (type: string) => {
    const types = {
      small: language === 'uz' ? '3 gacha shifokor' : 'До 3 врачей',
      medium: language === 'uz' ? '3-5 shifokor' : '3-5 врачей',
      large: language === 'uz' ? '5+ shifokor' : '5+ врачей'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div 
      className="bg-white border rounded-lg overflow-hidden hover:border-indigo-300 transition-colors cursor-pointer"
      onClick={onEdit}
    >
      {/* Clinic Logo */}
      <div className="aspect-video bg-gray-100 relative">
        {clinic.logo_url ? (
          <img
            src={clinic.logo_url}
            alt={language === 'uz' ? clinic.name_uz : clinic.name_ru}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Clinic Info */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">
          {language === 'uz' ? clinic.name_uz : clinic.name_ru}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div>{language === 'uz' ? clinic.city_uz : clinic.city_ru}</div>
              <div>{language === 'uz' ? clinic.address_uz : clinic.address_ru}</div>
            </div>
          </div>

          {/* Contact Info */}
          {clinic.phone_numbers?.[0] && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{clinic.phone_numbers[0]}</span>
            </div>
          )}

          {clinic.emails?.[0] && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{clinic.emails[0]}</span>
            </div>
          )}

          {clinic.website && (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <a
                href={clinic.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
                onClick={(e) => e.stopPropagation()}
              >
                {clinic.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {/* Rating and Subscription */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium">{clinic.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">
              ({clinic.review_count})
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {getSubscriptionTypeLabel(clinic.subscription_type)}
          </span>
        </div>
      </div>
    </div>
  );
};