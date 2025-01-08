import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguageStore } from '../../store/languageStore';
import { translations } from '../../i18n/translations';
import { Header } from '../../components/Header';
import { BottomNavigation } from '../../components/BottomNavigation';
import { AppointmentTimeline } from './components/AppointmentTimeline';
import { DateNavigation } from './components/DateNavigation';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { ViewEditAppointmentModal } from './components/ViewEditAppointmentModal';

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
  patient: Patient;
}

const Home: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentData, setAppointmentData] = useState({
    patient_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '09:00',
    notes: ''
  });
  const [newPatientData, setNewPatientData] = useState({
    full_name: '',
    phone: '',
    birthdate: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('full_name');
      
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase.from('patients').insert({
        dentist_id: user.id,
        ...newPatientData
      });

      if (error) throw error;
      await fetchPatients();
      setShowNewPatientForm(false);
      setNewPatientData({
        full_name: '',
        phone: '',
        birthdate: ''
      });
    } catch (error) {
      console.error('Error creating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const appointmentTime = new Date(appointmentData.appointment_date + 'T' + appointmentData.appointment_time);

      const { error } = await supabase.from('appointments').insert({
        dentist_id: user.id,
        patient_id: appointmentData.patient_id,
        appointment_time: appointmentTime.toISOString(),
        notes: appointmentData.notes
      });

      if (error) throw error;
      await fetchAppointments();
      setShowAppointmentModal(false);
      setAppointmentData({
        patient_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: '09:00',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (updatedAppointment: Appointment) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_time: updatedAppointment.appointment_time,
          notes: updatedAppointment.notes
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

  const navigateDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowViewEditModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        <div className="bg-white rounded-lg shadow p-4">
          <DateNavigation
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            navigateDay={navigateDay}
          />
          <AppointmentTimeline 
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>
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
        showNewPatientForm={showNewPatientForm}
        setShowNewPatientForm={setShowNewPatientForm}
        loading={loading}
        onCreatePatient={handleCreatePatient}
        onCreateAppointment={handleCreateAppointment}
        patients={patients}
        appointmentData={appointmentData}
        setAppointmentData={setAppointmentData}
        newPatientData={newPatientData}
        setNewPatientData={setNewPatientData}
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