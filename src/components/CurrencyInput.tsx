import React, { useState, useRef } from 'react';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  const formatValue = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with thousands separator
    const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    return formatted ? `${formatted} UZS` : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d\s]/g, '');
    onChange(formatValue(newValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      // Get the current value without "UZS" and spaces
      const currentDigits = value.replace(/[^\d]/g, '');
      
      if (currentDigits.length > 0) {
        // Remove the last digit
        const newDigits = currentDigits.slice(0, -1);
        onChange(formatValue(newDigits));
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // When clicking after "UZS", move cursor before it
    const input = e.currentTarget;
    const clickPosition = input.selectionStart || 0;
    const valueWithoutCurrency = value.replace(/ UZS$/, '');
    
    if (clickPosition > valueWithoutCurrency.length) {
      input.setSelectionRange(valueWithoutCurrency.length, valueWithoutCurrency.length);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Move cursor before "UZS" when focusing
    const valueWithoutCurrency = value.replace(/ UZS$/, '');
    e.target.setSelectionRange(valueWithoutCurrency.length, valueWithoutCurrency.length);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onFocus={handleFocus}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
    />
  );
};