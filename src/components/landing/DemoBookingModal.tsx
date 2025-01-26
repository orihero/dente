import React, { useState } from 'react';
import { X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';
import { PhoneInput } from '../PhoneInput';
import { supabase } from '../../lib/supabase';

interface DemoBookingModalProps {
  showModal: boolean;
  onClose: () => void;
  referredBy?: string;
}

export const DemoBookingModal: React.FC<DemoBookingModalProps> = ({
  showModal,
  onClose,
  referredBy
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].landing;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'calendar' | 'time'>('calendar');
  const [data, setData] = useState({
    full_name: '',
    phone: ''
  });

  // Get days in current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day names
  const getDayNames = () => {
    const days = language === 'uz' 
      ? ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
      : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 1; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  // Check if a date is available (not in the past)
  const isDateAvailable = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    
    // Don't allow navigating to past months
    const today = new Date();
    if (newDate.getFullYear() < today.getFullYear() || 
        (newDate.getFullYear() === today.getFullYear() && newDate.getMonth() < today.getMonth())) {
      return;
    }
    
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    if (!isDateAvailable(day)) return;
    
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(selectedDate);
    setStep('time');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError(language === 'uz' 
        ? 'Iltimos, sana va vaqtni tanlang' 
        : 'Пожалуйста, выберите дату и время');
      setLoading(false);
      return;
    }

    try {
      // Create appointment time by combining selected date and time
      const [hours, minutes] = selectedTime.split(':');
      const appointmentTime = new Date(selectedDate);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error: leadError } = await supabase
        .from('leads')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          referred_by: referredBy || null,
          appointment_time: appointmentTime.toISOString()
        });

      if (leadError) throw leadError;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setData({
          full_name: '',
          phone: ''
        });
        setSelectedDate(null);
        setSelectedTime(null);
        setStep('calendar');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating lead:', error);
      setError(language === 'uz' 
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.'
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const monthNames = {
    uz: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'],
    ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{t.bookDemo}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'uz' 
                ? 'So\'rovingiz qabul qilindi!'
                : 'Ваша заявка принята!'}
            </h3>
            <p className="text-gray-600">
              {language === 'uz'
                ? 'Tez orada siz bilan bog\'lanamiz'
                : 'Мы свяжемся с вами в ближайшее время'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName}
              </label>
              <input
                type="text"
                required
                value={data.full_name}
                onChange={(e) => setData({ ...data, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.phone}
              </label>
              <PhoneInput
                value={data.phone}
                onChange={(value) => setData({ ...data, phone: value })}
              />
            </div>

            {/* Calendar and Time Selection */}
            {!selectedTime ? (
              <div className="border rounded-lg p-4">
                {step === 'calendar' ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="font-medium">
                        {monthNames[language][currentDate.getMonth()]} {currentDate.getFullYear()}
                      </span>
                      <button 
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {getDayNames().map((day, index) => (
                        <div key={index} className="text-center text-sm text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays().map((day, index) => {
                        const available = day !== null && isDateAvailable(day);
                        const isSelected = selectedDate?.getDate() === day && 
                                         selectedDate?.getMonth() === currentDate.getMonth();
                        
                        return (
                          <div key={index} className="aspect-square">
                            {day !== null && (
                              <button
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                disabled={!available}
                                className={`
                                  w-full h-full flex items-center justify-center rounded-full text-sm
                                  transition-colors duration-200
                                  ${isSelected 
                                    ? 'bg-indigo-600 text-white' 
                                    : available
                                      ? 'bg-indigo-50 hover:bg-indigo-100 text-gray-900'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }
                                `}
                              >
                                {day}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setStep('calendar')}
                      className="flex items-center text-indigo-600 mb-4"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span>{language === 'uz' ? 'Sanaga qaytish' : 'Вернуться к дате'}</span>
                    </button>
                    
                    <h3 className="font-medium mb-4">
                      {language === 'uz' ? 'Vaqtni tanlang' : 'Выберите время'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {generateTimeSlots().map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`
                            p-2 text-sm rounded-md transition-colors duration-200
                            ${selectedTime === time
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-gray-900'
                            }
                          `}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      {language === 'uz' ? 'Tanlangan sana va vaqt' : 'Выбранные дата и время'}
                    </p>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString(language === 'uz' ? 'uz-UZ' : 'ru-RU')} {selectedTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTime(null);
                      setStep('calendar');
                    }}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    {language === 'uz' ? 'O\'zgartirish' : 'Изменить'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};