import React, { useEffect, useRef } from 'react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ 
  value, 
  onChange, 
  className = '' 
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].common;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set default country code when input is empty and gets focus
    const handleFocus = () => {
      if (!value) {
        onChange('+998');
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      return () => input.removeEventListener('focus', handleFocus);
    }
  }, [value, onChange]);

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters except +
    const digits = input.replace(/[^\d+]/g, '');
    
    // Ensure the number starts with +998
    if (!digits.startsWith('+998')) {
      return '+998';
    }
    
    // Format as +998 XX XXX XX XX
    let formatted = '';
    if (digits.length > 0) formatted += digits.substring(0, 4); // +998
    if (digits.length > 4) formatted += ' ' + digits.substring(4, 6);
    if (digits.length > 6) formatted += ' ' + digits.substring(6, 9);
    if (digits.length > 9) formatted += ' ' + digits.substring(9, 11);
    if (digits.length > 11) formatted += ' ' + digits.substring(11, 13);

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <input
      ref={inputRef}
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder={t.phonePlaceholder}
      className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      maxLength={17} // +998 XX XXX XX XX
    />
  );
};