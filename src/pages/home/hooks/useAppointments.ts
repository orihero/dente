import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Appointment } from '../types';
import { useLanguageStore } from '../../../store/languageStore';

export const useAppointments = (selectedDate: Date) => {
  const { language } = useLanguageStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { startOfWeek, endOfWeek };
  };

  const fetchAppointments = async () => {
    try {
      setError(null);
      
      // Get date range based on view
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      const startDate = startOfWeek;
      const endDate = endOfWeek;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          services:appointment_services(
            id,
            service:dentist_services(
              id,
              price,
              duration,
              warranty,
              base_service:base_services(
                name_uz,
                name_ru
              )
            )
          )
        `)
        .gte('appointment_time', startDate.toISOString())
        .lte('appointment_time', endDate.toISOString())
        .order('appointment_time');

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setError(language === 'uz' ? 'Qabullarni yuklashda xatolik yuz berdi' : 'Ошибка при загрузке приёмов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let patientId = data.patient_id;

      // If no patient_id, create a new patient
      if (!patientId) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            dentist_id: user.id,
            full_name: data.full_name,
            phone: data.phone,
            birthdate: data.birthdate,
            address: data.address
          })
          .select()
          .single();

        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      const appointmentTime = new Date(data.appointment_date + 'T' + data.appointment_time);

      // Create appointment
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          dentist_id: user.id,
          patient_id: patientId,
          appointment_time: appointmentTime.toISOString(),
          notes: data.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Create appointment services if any
      if (data.services && data.services.length > 0) {
        const { error: servicesError } = await supabase
          .from('appointment_services')
          .insert(
            data.services.map((service: any) => ({
              appointment_id: appointment.id,
              service_id: service.id
            }))
          );

        if (servicesError) throw servicesError;
      }

      await fetchAppointments();
      return appointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
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
          notes: updatedAppointment.notes,
          status: updatedAppointment.status
        })
        .eq('id', updatedAppointment.id);

      if (error) throw error;
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;
      await fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    createAppointment: handleCreateAppointment,
    updateAppointment: handleUpdateAppointment,
    deleteAppointment: handleDeleteAppointment,
    refreshAppointments: fetchAppointments
  };
};