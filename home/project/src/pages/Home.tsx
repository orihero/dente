import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AppointmentTimeline } from './home/components/AppointmentTimeline';
import { DateNavigation } from './home/components/DateNavigation';
import { NewAppointmentModal } from './home/components/NewAppointmentModal';
import { ViewEditAppointmentModal } from './home/components/ViewEditAppointmentModal';
import { HomeSkeleton } from './home/components/HomeSkeleton';

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  patient: Patient;
}

export const Home: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentData, setAppointmentData] = useState({
    patient_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    notes: '',
    phone: '',
    full_name: '',
    address: '',
    birthdate: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const navigateDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const fetchAppointments = async () => {
    try {
      setError(null);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*)
        `)
        .gte('appointment_time', startOfDay.toISOString())
        .lte('appointment_time', endOfDay.toISOString())
        .order('appointment_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(language === 'uz' ? 'Qabullarni yuklashda xatolik yuz berdi' : 'Ошибка при загрузке приёмов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let patientId = appointmentData.patient_id;

      // If no patient_id, create a new patient
      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            dentist_id: user.id,
            full_name: appointmentData.full_name,
            phone: appointmentData.phone,
            birthdate: appointmentData.birthdate,
            address: appointmentData.address
          })
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      const appointmentTime = new Date(appointmentData.appointment_date + 'T' + appointmentData.appointment_time);

      const { data: appointment, error } = await supabase.from('appointments').insert({
        dentist_id: user.id,
        patient_id: patientId,
        appointment_time: appointmentTime.toISOString(),
        notes: appointmentData.notes
      }).select().single();

      if (error) throw error;

      await fetchAppointments();
      setShowAppointmentModal(false);
      setAppointmentData({
        patient_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        notes: '',
        phone: '',
        full_name: '',
        address: '',
        birthdate: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAppointment = (appointment: Appointment) => {
    navigate(`/users/${appointment.patient_id}`);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewEditModal(true);
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_time: updatedAppointment.appointment_time,
          notes: updatedAppointment.notes,
          status: updatedAppointment.status
        })
        .eq('id', updatedAppointment.id);

      if (error) throw error;
      await fetchAppointments();
      setShowViewEditModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;
    
    if (!window.confirm(t.confirmDelete)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', selectedAppointment.id);

      if (error) throw error;
      await fetchAppointments();
      setShowViewEditModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              {language === 'uz' ? 'Qayta urinish' : 'Повторить попытку'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <DateNavigation
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              navigateDay={navigateDay}
            />
            <AppointmentTimeline 
              appointments={appointments}
              onAppointmentClick={() => {}}
              onStartAppointment={handleStartAppointment}
              onEditAppointment={handleEditAppointment}
            />
          </div>
        )}
      </div>

      <BottomNavigation />

      <button
        onClick={() => setShowAppointmentModal(true)}
        className="fixed right-6 bottom-20 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label={t.newAppointment}
      >
        <Plus className="w-6 h-6" />
      </button>

      <NewAppointmentModal
        showModal={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
        loading={loading}
        onCreateAppointment={handleCreateAppointment}
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