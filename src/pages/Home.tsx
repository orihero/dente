import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { DateNavigation } from './home/components/DateNavigation';
import { NewAppointmentModal } from './home/components/NewAppointmentModal';
import { ViewEditAppointmentModal } from './home/components/ViewEditAppointmentModal';
import { HomeSkeleton } from './home/components/HomeSkeleton';
import { CalendarView } from './home/components/calendar/CalendarView';
import { useAppointments } from './home/hooks/useAppointments';
import { Appointment } from './home/types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'daily' | 'weekly'>('daily');
  const [appointmentData, setAppointmentData] = useState({
    patient_id: location.state?.patient?.id || '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    notes: '',
    phone: location.state?.patient?.phone || '',
    full_name: location.state?.patient?.full_name || '',
    address: location.state?.patient?.address || '',
    birthdate: location.state?.patient?.birthdate || '',
    services: [] as any[]
  });

  // Set showAppointmentModal based on location state
  useEffect(() => {
    if (location.state?.showAppointmentModal) {
      setShowAppointmentModal(true);
    }
  }, [location.state]);
  const {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment
  } = useAppointments(selectedDate);

  const handleCreateAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment(appointmentData);
      setShowAppointmentModal(false);
      setAppointmentData({
        patient_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        notes: '',
        phone: '',
        full_name: '',
        address: '',
        birthdate: '',
        services: []
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  const handleStartAppointment = (appointment: Appointment) => {
    navigate(`/users/${appointment.patient_id}`);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewEditModal(true);
  };

  const handleCreateAppointment = (date: Date) => {
    setAppointmentData(prev => ({
      ...prev,
      appointment_date: date.toISOString().split('T')[0],
      appointment_time: date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    setShowAppointmentModal(true);
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    try {
      await updateAppointment(updatedAppointment);
      setShowViewEditModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await deleteAppointment(selectedAppointment.id);
      setShowViewEditModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              {language === 'uz' ? 'Qayta urinish' : 'Повторить попытку'}
            </button>
          </div>
        ) : (
          <CalendarView
            view={view}
            onViewChange={setView}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            appointments={appointments}
            onStartAppointment={handleStartAppointment}
            onEditAppointment={handleEditAppointment}
            onCreateAppointment={handleCreateAppointment}
          />
        )}
      </div>

      <BottomNavigation />

      <NewAppointmentModal
        showModal={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        loading={loading}
        onCreateAppointment={handleCreateAppointmentSubmit}
        appointmentData={appointmentData}
        setAppointmentData={setAppointmentData}
      />

      {selectedAppointment && (
        <ViewEditAppointmentModal
          showModal={showViewEditModal}
          onClose={() => {
            setShowViewEditModal(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onUpdate={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Home;