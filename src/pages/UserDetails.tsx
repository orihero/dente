import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, Phone, UserPlus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { EditUserModal } from './users/components/EditUserModal';
import { FamilyMemberModal } from './users/components/FamilyMemberModal';
import { ServiceModal } from './users/components/ServiceModal';
import { PaymentModal } from './users/components/PaymentModal';
import { FamilyMembersList } from './users/components/FamilyMembersList';
import { ServicesList } from './users/components/ServicesList';
import { PaymentsList } from './users/components/PaymentsList';
import { RecordModal } from './users/components/RecordModal';
import { RecordsList } from './users/components/RecordsList';
import { RecordDetailsModal } from './users/components/RecordDetailsModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { ViewFamilyMembersModal } from './users/components/ViewFamilyMembersModal';

interface User {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
}

export const UserDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].users;
  
  const [user, setUser] = useState<User | null>(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState<'records' | 'payments'>('records');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFamilyMemberModal, setShowFamilyMemberModal] = useState(false);
  const [showViewFamilyMembersModal, setShowViewFamilyMembersModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showRecordDetailsModal, setShowRecordDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchFamilyMembers();
    fetchRecords();
    fetchPayments();
  }, [id]);

  const fetchUser = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      navigate('/users');
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('patient_id', id)
        .order('created_at');

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select(`
          *,
          services:record_services(
            id,
            service_id,
            price,
            service:dentist_services(
              base_service:base_services(
                name_uz,
                name_ru
              ),
              duration,
              warranty
            )
          ),
          files:record_files(
            id,
            file_url
          )
        `)
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          record:patient_records(
            id,
            record_number,
            diagnosis,
            total_price,
            created_at,
            services:record_services(
              id,
              service_id,
              price,
              service:dentist_services(
                base_service:base_services(
                  name_uz,
                  name_ru
                ),
                duration,
                warranty
              )
            ),
            files:record_files(
              id,
              file_url
            )
          )
        `)
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleUpdateUser = async (updatedData: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .update(updatedData)
        .eq('id', user.id);

      if (error) throw error;
      await fetchUser();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !window.confirm(t.confirmDelete)) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      navigate('/users');
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilyMember = async (data: any) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('family_members')
        .insert({
          patient_id: id,
          ...data
        });

      if (error) throw error;
      await fetchFamilyMembers();
      setShowFamilyMemberModal(false);
    } catch (error) {
      console.error('Error adding family member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('No user found');

      // Create record
      const { data: record, error: recordError } = await supabase
        .from('patient_records')
        .insert({
          patient_id: id,
          dentist_id: currentUser.id,
          diagnosis: data.diagnosis,
          total_price: data.total_price
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Create record services
      if (data.services.length > 0) {
        const { error: servicesError } = await supabase
          .from('record_services')
          .insert(
            data.services.map((service: any) => ({
              record_id: record.id,
              service_id: service.id,
              price: service.price
            }))
          );

        if (servicesError) throw servicesError;
      }

      // Create record files
      if (data.files.length > 0) {
        const { error: filesError } = await supabase
          .from('record_files')
          .insert(
            data.files.map((file: any) => ({
              record_id: record.id,
              file_url: file
            }))
          );

        if (filesError) throw filesError;
      }

      // Create initial payment if provided
      if (data.initial_payment) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            patient_id: id,
            dentist_id: currentUser.id,
            record_id: record.id,
            amount: data.initial_payment,
            payment_type: data.payment_type
          });

        if (paymentError) throw paymentError;
      }

      await Promise.all([fetchRecords(), fetchPayments()]);
      setShowRecordModal(false);
    } catch (error) {
      console.error('Error creating record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (data: any) => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('No user found');

      const { error } = await supabase
        .from('payments')
        .insert({
          patient_id: id,
          dentist_id: currentUser.id,
          record_id: data.record_id,
          amount: data.amount,
          payment_type: data.payment_type,
          notes: data.notes
        });

      if (error) throw error;
      await fetchPayments();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordClick = (record: any) => {
    setSelectedRecord(record);
    setShowRecordDetailsModal(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/users')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">
                {t.userDetails}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="p-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {user.full_name}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3" />
                <span>
                  {new Date(user.birthdate).toLocaleDateString(
                    language === 'uz' ? 'uz-UZ' : 'ru-RU',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">{familyMembers.length} {t.familyMembers}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFamilyMemberModal(true)}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  {t.addFamilyMember}
                </button>
                {familyMembers.length > 0 && (
                  <button
                    onClick={() => setShowViewFamilyMembersModal(true)}
                    className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                  >
                    View All
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('records')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'records'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Records
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'payments'
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.payments}
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'records' ? (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowRecordModal(true)}
                      className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Create Record</span>
                    </button>
                  </div>
                  <RecordsList 
                    records={records} 
                    onRefresh={fetchRecords} 
                    onRecordClick={handleRecordClick}
                  />
                </>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                    >
                      <Plus className="w-5 h-5" />
                      <span>{t.addPayment}</span>
                    </button>
                  </div>
                  <PaymentsList 
                    payments={payments} 
                    onRefresh={fetchPayments}
                    onRecordClick={handleRecordClick}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />

      <EditUserModal
        showModal={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
        loading={loading}
        user={user}
      />

      <FamilyMemberModal
        showModal={showFamilyMemberModal}
        onClose={() => setShowFamilyMemberModal(false)}
        onSubmit={handleAddFamilyMember}
        loading={loading}
      />

      <ViewFamilyMembersModal
        showModal={showViewFamilyMembersModal}
        onClose={() => setShowViewFamilyMembersModal(false)}
        members={familyMembers}
        onRefresh={fetchFamilyMembers}
      />

      <RecordModal
        showModal={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onSubmit={handleCreateRecord}
        loading={loading}
        patientId={id!}
      />

      <PaymentModal
        showModal={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleAddPayment}
        loading={loading}
        patientId={id!}
      />

      {selectedRecord && (
        <RecordDetailsModal
          showModal={showRecordDetailsModal}
          onClose={() => {
            setShowRecordDetailsModal(false);
            setSelectedRecord(null);
          }}
          record={selectedRecord}
          onRefresh={fetchRecords}
        />
      )}
    </div>
  );
};