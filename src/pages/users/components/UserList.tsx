import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, Plus, Send, MapPin, Copy, CreditCard, CalendarPlus } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { PaymentModal } from './PaymentModal';
import { supabase } from '../../../lib/supabase';
import { formatDateTime } from '../../../utils/dateUtils';

interface User {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
  address: string;
  created_at: string;
  balance?: number;
  telegram_registered?: boolean;
}

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatingLink, setGeneratingLink] = useState<Record<string, boolean>>({});
  const [linkCopied, setLinkCopied] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchBalances();
  }, [users]);

  const fetchBalances = async () => {
    try {
      // Get all records with their total prices
      const { data: records, error: recordsError } = await supabase
        .from('patient_records')
        .select('patient_id, total_price')
        .in('patient_id', users.map(user => user.id));

      if (recordsError) throw recordsError;

      // Get all payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('patient_id, amount')
        .in('patient_id', users.map(user => user.id));

      if (paymentsError) throw paymentsError;

      // Calculate balance for each user
      const userBalances: Record<string, number> = {};
      
      users.forEach(user => {
        const userRecords = records?.filter(record => record.patient_id === user.id) || [];
        const userPayments = payments?.filter(payment => payment.patient_id === user.id) || [];
        
        const totalDebt = userRecords.reduce((sum, record) => sum + record.total_price, 0);
        const totalPaid = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
        
        userBalances[user.id] = totalPaid - totalDebt;
      });

      setBalances(userBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleAddPayment = async (paymentData: any) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('payments')
        .insert({
          patient_id: selectedUser.id,
          dentist_id: user.id,
          record_id: paymentData.record_id,
          amount: parseInt(paymentData.amount.replace(/\D/g, '')),
          payment_type: paymentData.payment_type,
          notes: paymentData.notes
        });

      if (error) throw error;
      await fetchBalances();
      setShowPaymentModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegramInvite = async (user: User) => {
    setGeneratingLink(prev => ({ ...prev, [user.id]: true }));
    try {
      // First check if user already has a registration token
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('telegram_registration_token')
        .eq('id', user.id)
        .single();

      if (patientError) throw patientError;

      let token = patient.telegram_registration_token;

      // If no token exists, generate a new one
      if (!token) {
        const { data, error } = await supabase
          .rpc('generate_telegram_registration_token', {
            patient_id: user.id
          });

        if (error) throw error;
        if (!data) throw new Error('Failed to generate token');
        token = data;
      }

      const inviteLink = `https://t.me/denteuzbot?start=${token}`;
      await navigator.clipboard.writeText(inviteLink);
      alert(language === 'uz' ? 'Havola nusxalandi!' : 'Ссылка скопирована!');
    } catch (error: any) {
      console.error('Error generating Telegram invite:', error);
      alert(language === 'uz' 
        ? 'Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko\'ring.' 
        : 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    } finally {
      setGeneratingLink(prev => ({ ...prev, [user.id]: false }));
    }
  };

  const handleCreateAppointment = (user: User) => {
    navigate('/dashboard', { 
      state: { 
        showAppointmentModal: true,
        patient: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          birthdate: user.birthdate,
          address: user.address
        }
      }
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as +998 XX XXX XX XX for display
    const digits = phone.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += '+' + digits.substring(0, 3); // +998
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.substring(10, 12);
    return formatted;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noUsers}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div
            key={user.id} 
            onClick={() => navigate(`/users/${user.id}`)} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">#{user.id.split('-')[0]}</span>
                {user.telegram_registered && (
                  <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    {language === 'uz' ? 'Telegram' : 'Телеграм'}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatDateTime(user.created_at)}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-medium text-indigo-600">
                    {user.full_name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {user.full_name}
                </h3>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{formatPhoneNumber(user.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {new Date(user.birthdate).toLocaleDateString(
                        language === 'uz' ? 'uz-UZ' : 'ru-RU'
                      )}
                    </span>
                  </div>
                  {user.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-gray-600">{t.balance}:</span>
              <span className={`font-medium ${
                (balances[user.id] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(balances[user.id] || 0).toLocaleString()} UZS
              </span>
            </div>

            <div className="flex items-center gap-2 p-4 border-t">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateAppointment(user);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>{language === 'uz' ? 'Qabul' : 'Приём'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation
                  setSelectedUser(user);
                  setShowPaymentModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <CreditCard className="w-4 h-4" />
                <span>{language === 'uz' ? 'To\'lov' : 'Оплата'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigation
                  handleTelegramInvite(user);
                }}
                disabled={generatingLink[user.id] || user.telegram_registered}
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ml-auto ${
                  user.telegram_registered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {user.telegram_registered
                    ? (language === 'uz' ? 'Bot' : 'Бот')
                    : 'Telegram'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <PaymentModal
          showModal={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedUser(null);
          }}
          onSubmit={handleAddPayment}
          loading={loading}
          patientId={selectedUser.id}
        />
      )}
    </>
  );
};