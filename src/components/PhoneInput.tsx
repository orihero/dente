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
        onChange('998');
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      return () => input.removeEventListener('focus', handleFocus);
    }
  }, [value, onChange]);

  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Ensure the number starts with 998
    if (!digits.startsWith('998')) {
      return '998';
    }
    
    // Format for display only - the actual value will be just digits
    let formatted = '';
    if (digits.length > 0) formatted += '+' + digits.substring(0, 3); // +998
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.substring(10, 12);

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Store only digits in the actual value
    const digitsOnly = e.target.value.replace(/\D/g, '');
    onChange(digitsOnly);
  };

  // Format the display value but keep the actual value as digits only
  const displayValue = formatPhoneNumber(value);

  return (
    <input
      ref={inputRef}
      type="tel"
      value={displayValue}
      onChange={handleChange}
      placeholder={t.phonePlaceholder}
      className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      maxLength={17} // +998 XX XXX XX XX
    />
  );
};