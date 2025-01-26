import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { AdminHeader } from './admin/components/AdminHeader';
import { AdminSidebar } from './admin/components/AdminSidebar';
import { LeadsTable } from './admin/components/LeadsTable';
import { DentistsTable } from './admin/components/DentistsTable';
import { StatisticsCards } from './admin/components/StatisticsCards';
import { AppointmentsTable } from './admin/components/AppointmentsTable';
import { RecordsTable } from './admin/components/RecordsTable';
import { AdminSettings } from './admin/components/AdminSettings';
import { ClinicsTable } from './admin/components/ClinicsTable';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'dentists' | 'appointments' | 'records' | 'settings' | 'clinics'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    checkAdminAccess();
  }, [retryCount]);

  const checkAdminAccess = async () => {
    try {
      setError(null);
      const { data: isAdmin, error: fnError } = await supabase
        .rpc('is_admin_dentist');

      if (fnError) {
        // Handle network errors specifically
        if (fnError.message?.includes('Failed to fetch')) {
          throw new Error(language === 'uz' 
            ? 'Internet aloqasi xatosi. Iltimos, internetga ulanishni tekshiring.'
            : 'Ошибка подключения к интернету. Пожалуйста, проверьте подключение.');
        }
        throw fnError;
      }

      if (!isAdmin) {
        navigate('/dashboard');
        return;
      }

      setLoading(false);
      setError(null);
    } catch (error: any) {
      console.error('Error checking admin access:', error);
      
      // If it's a network error and we haven't exceeded max retries
      if (error.message?.includes('Failed to fetch') && retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }

      // If it's an auth error or we've exceeded retries
      if (error.status === 401 || retryCount >= maxRetries) {
        navigate('/login');
        return;
      }

      setError(error.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setRetryCount(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-medium">{error}</h2>
          </div>
          <button
            onClick={handleRetry}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {language === 'uz' ? 'Qayta urinish' : 'Повторить попытку'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 p-8">
          {activeTab === 'overview' && <StatisticsCards />}
          {activeTab === 'leads' && <LeadsTable />}
          {activeTab === 'dentists' && <DentistsTable />}
          {activeTab === 'appointments' && <AppointmentsTable />}
          {activeTab === 'records' && <RecordsTable />}
          {activeTab === 'settings' && <AdminSettings />}
          {activeTab === 'clinics' && <ClinicsTable />}
        </main>
      </div>
    </div>
  );
};