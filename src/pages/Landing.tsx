import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [referredBy, setReferredBy] = useState<string | undefined>();

  useEffect(() => {
    checkUser();
    checkReferral();
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

  const checkReferral = () => {
    // Check if this is a referral URL
    const match = location.pathname.match(/^\/refer\/([0-9a-f-]+)$/i);
    if (match) {
      const dentistId = match[1];
      setReferredBy(dentistId);
      // Redirect to home page but keep the referral info
      navigate('/', { replace: true });
      // Show demo modal automatically for referrals
      setShowDemoModal(true);
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
        referredBy={referredBy}
      />
    </div>
  );
};