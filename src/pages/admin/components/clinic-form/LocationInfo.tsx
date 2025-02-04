import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface LocationInfoProps {
  data: {
    city: string;
    district: string;
    address: string;
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

  // Helper function to update both language versions
  const handleChange = (field: 'city' | 'district' | 'address', value: string) => {
    onChange({
      [`${field}_uz`]: value,
      [`${field}_ru`]: value,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        {language === 'uz' ? 'Manzil' : 'Адрес'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Shahar' : 'Город'}
          </label>
          <input
            type="text"
            required
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Tuman' : 'Район'}
          </label>
          <input
            type="text"
            required
            value={data.district}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {language === 'uz' ? 'Manzil' : 'Адрес'}
          </label>
          <input
            type="text"
            required
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

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