import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { AppointmentTimeline } from '../components/AppointmentTimeline';
import { DateNavigation } from '../components/DateNavigation';
import { NewAppointmentModal } from '../components/NewAppointmentModal';

export const Home: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
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

  // ... (keep all the fetch and handle functions)

  const navigateDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
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
          <AppointmentTimeline appointments={appointments} />
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
    </div>
  );
};