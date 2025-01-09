import React from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, className = '' }) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digit characters
    const digits = input.replace(/\D/g, '');
    
    // Format as +998 XX XXX XX XX
    let formatted = '';
    if (digits.length > 0) formatted += '+' + digits.substring(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.substring(10, 12);

    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
  };

  return (
    <input
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="+998 XX XXX XX XX"
      className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
      maxLength={17} // +998 XX XXX XX XX
    />
  );
};