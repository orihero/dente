import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface LocationInfoProps {
  data: {
    city_uz: string;
    city_ru: string;
    district_uz: string;
    district_ru: string;
    address_uz: string;
    address_ru: string;
    geo_location: {
      lat: number;
      lng: number;
    };
  };
  onChange: (data: Partial<LocationInfoProps['data']>) => void;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  data,
  onChange
}) => {
  const { language } = useLanguageStore();

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        {language === 'uz' ? 'Manzil' : 'Адрес'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Shahar (O\'zbekcha)' : 'Город (Узбекский)'}
          </label>
          <input
            type="text"
            required
            value={data.city_uz}
            onChange={(e) => onChange({ city_uz: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Shahar (Ruscha)' : 'Город (Русский)'}
          </label>
          <input
            type="text"
            required
            value={data.city_ru}
            onChange={(e) => onChange({ city_ru: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Tuman (O\'zbekcha)' : 'Район (Узбекский)'}
          </label>
          <input
            type="text"
            required
            value={data.district_uz}
            onChange={(e) => onChange({ district_uz: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Tuman (Ruscha)' : 'Район (Русский)'}
          </label>
          <input
            type="text"
            required
            value={data.district_ru}
            onChange={(e) => onChange({ district_ru: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Manzil (O\'zbekcha)' : 'Адрес (Узбекский)'}
          </label>
          <input
            type="text"
            required
            value={data.address_uz}
            onChange={(e) => onChange({ address_uz: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Manzil (Ruscha)' : 'Адрес (Русский)'}
          </label>
          <input
            type="text"
            required
            value={data.address_ru}
            onChange={(e) => onChange({ address_ru: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Kenglik' : 'Широта'}
          </label>
          <input
            type="number"
            step="any"
            required
            value={data.geo_location.lat}
            onChange={(e) => onChange({
              geo_location: { ...data.geo_location, lat: parseFloat(e.target.value) }
            })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Uzunlik' : 'Долгота'}
          </label>
          <input
            type="number"
            step="any"
            required
            value={data.geo_location.lng}
            onChange={(e) => onChange({
              geo_location: { ...data.geo_location, lng: parseFloat(e.target.value) }
            })}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};