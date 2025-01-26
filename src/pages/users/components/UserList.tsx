import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, Plus, Send } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';
import { PaymentModal } from './PaymentModal';

interface User {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
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

  const handleAddPayment = async (data: any) => {
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
          record_id: data.record_id,
          amount: parseInt(data.amount.replace(/\D/g, '')),
          payment_type: data.payment_type,
          notes: data.notes
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
      const { data, error } = await supabase
        .rpc('generate_telegram_registration_token', {
          patient_id: user.id
        });

      if (error) throw error;

      if (!data) throw new Error('Failed to generate token');

      const inviteLink = `https://t.me/denteuzbot?start=${data}`;
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
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer"
            onClick={() => navigate(`/users/${user.id}`)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {user.full_name}
                </h3>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="text-sm">{formatPhoneNumber(user.phone)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(user.birthdate).toLocaleDateString(
                        language === 'uz' ? 'uz-UZ' : 'ru-RU'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation
                    setSelectedUser(user);
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-500 px-2 py-1 rounded-md hover:bg-indigo-50"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">{t.addPayment}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation
                    handleTelegramInvite(user);
                  }}
                  disabled={generatingLink[user.id] || user.telegram_registered}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                    user.telegram_registered
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm">
                    {user.telegram_registered
                      ? (language === 'uz' ? 'Ulangan' : 'Подключен')
                      : (language === 'uz' ? 'Telegram' : 'Телеграм')}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">{t.balance}:</span>
              <span className={`font-medium ${
                (balances[user.id] || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {(balances[user.id] || 0).toLocaleString()} UZS
              </span>
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