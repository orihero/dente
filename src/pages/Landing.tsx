import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Header } from '../components/landing/Header';
import { Hero } from '../components/landing/Hero';
import { AppointmentFeature } from '../components/features/AppointmentFeature';
import { PatientManagementFeature } from '../components/features/PatientManagementFeature';
import { FinancialFeature } from '../components/features/FinancialFeature';
import { ReferralFeature } from '../components/features/ReferralFeature';
import { LoyaltyFeature } from '../components/features/LoyaltyFeature';
import { SmilePreviewFeature } from '../components/features/SmilePreviewFeature';
import { ProcessFeature } from '../components/features/ProcessFeature';
import { PricingFeature } from '../components/features/PricingFeature';
import { FAQFeature } from '../components/features/FAQFeature';
import { FooterFeature } from '../components/features/FooterFeature';
import { DemoBookingModal } from '../components/landing/DemoBookingModal';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Header onDemoClick={() => setShowDemoModal(true)} />
      <Hero onDemoClick={() => setShowDemoModal(true)} />
      <AppointmentFeature />
      <PatientManagementFeature />
      <FinancialFeature />
      <ReferralFeature />
      <LoyaltyFeature />
      <SmilePreviewFeature />
      <ProcessFeature />
      <PricingFeature />
      <FAQFeature />
      <FooterFeature />
      
      <DemoBookingModal
        showModal={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </div>
  );
};