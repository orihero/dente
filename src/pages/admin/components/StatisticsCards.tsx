import React, { useState, useEffect } from 'react';
import { Users, PhoneCall, UserCheck, UserX, Calendar, FileText, User } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface Statistics {
  totalDentists: number;
  totalLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  totalPatients: number;
  totalAppointments: number;
  totalRecords: number;
}

const defaultStats: Statistics = {
  totalDentists: 0,
  totalLeads: 0,
  convertedLeads: 0,
  rejectedLeads: 0,
  totalPatients: 0,
  totalAppointments: 0,
  totalRecords: 0
};

export const StatisticsCards: React.FC = () => {
  const { language } = useLanguageStore();
  const [stats, setStats] = useState<Statistics>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, [retryCount]);

  const fetchStatistics = async () => {
    try {
      setError(null);
      
      // First check if user is admin
      const { data: isAdmin } = await supabase.rpc('is_admin_dentist');
      if (!isAdmin) {
        throw new Error(language === 'uz' 
          ? 'Sizda ruxsat yo\'q'
          : 'У вас нет разрешения'
        );
      }

      const { data, error } = await supabase.rpc('get_admin_statistics');
      if (error) throw error;
      
      // Ensure all values are numbers with default value of 0
      const processedStats: Statistics = {
        totalDentists: Number(data?.total_dentists) || 0,
        totalLeads: Number(data?.total_leads) || 0,
        convertedLeads: Number(data?.converted_leads) || 0,
        rejectedLeads: Number(data?.rejected_leads) || 0,
        totalPatients: Number(data?.total_patients) || 0,
        totalAppointments: Number(data?.total_appointments) || 0,
        totalRecords: Number(data?.total_records) || 0
      };
      
      setStats(processedStats);
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      setError(language === 'uz'
        ? 'Statistikani yuklashda xatolik yuz berdi'
        : 'Ошибка при загрузке статистики'
      );

      // If it's a connection error and we haven't retried too many times, retry
      if (error.message?.includes('Failed to fetch') && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setRetryCount(0);
  };

  const cards = [
    {
      title: language === 'uz' ? 'Jami shifokorlar' : 'Всего врачей',
      value: stats.totalDentists,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: language === 'uz' ? 'Jami bemorlar' : 'Всего пациентов',
      value: stats.totalPatients,
      icon: User,
      color: 'bg-purple-500'
    },
    {
      title: language === 'uz' ? 'Jami qabullar' : 'Всего приёмов',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-yellow-500'
    },
    {
      title: language === 'uz' ? 'Jami yozuvlar' : 'Всего записей',
      value: stats.totalRecords,
      icon: FileText,
      color: 'bg-pink-500'
    },
    {
      title: language === 'uz' ? 'Jami so\'rovlar' : 'Всего заявок',
      value: stats.totalLeads,
      icon: PhoneCall,
      color: 'bg-indigo-500'
    },
    {
      title: language === 'uz' ? 'Ro\'yxatdan o\'tganlar' : 'Зарегистрированные',
      value: stats.convertedLeads,
      icon: UserCheck,
      color: 'bg-green-500'
    },
    {
      title: language === 'uz' ? 'Rad etilganlar' : 'Отклоненные',
      value: stats.rejectedLeads,
      icon: UserX,
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            {language === 'uz' ? 'Qayta urinish' : 'Повторить попытку'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {card.title}
            </h3>
            <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};