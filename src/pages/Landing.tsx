import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  const { dentistId } = useParams<{ dentistId?: string }>();
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [referredBy, setReferredBy] = useState<string | undefined>();

  useEffect(() => {
    checkUser();
    
    // Check for referral in URL path
    const match = location.pathname.match(/\/refer\/([^\/]+)/);
    if (match) {
      const referralId = match[1];
      setReferredBy(referralId);
      setShowDemoModal(true);
      // Navigate to root but preserve referral info in state
      navigate('/', { 
        replace: true,
        state: { referredBy: referralId }
      });
    } else if (dentistId) {
      setReferredBy(dentistId);
      setShowDemoModal(true);
      navigate('/', { 
        replace: true,
        state: { referredBy: dentistId }
      });
    }
  }, [dentistId, location.pathname, navigate]);

  // Separate useEffect for scroll handling
  useEffect(() => {
    const hasShownModal = sessionStorage.getItem('hasShownDemoModal') === 'true';
    
    const handleScroll = () => {
      if (!hasShownModal && !showDemoModal) {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercentage > 50) {
          setShowDemoModal(true);
          sessionStorage.setItem('hasShownDemoModal', 'true');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showDemoModal]);

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

  const handleCloseModal = () => {
    setShowDemoModal(false);
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
      <PricingFeature onDemoClick={() => setShowDemoModal(true)} />
      <FAQFeature />
      <FooterFeature />
      
      <DemoBookingModal
        showModal={showDemoModal}
        onClose={handleCloseModal}
        referredBy={referredBy}
      />
    </div>
  );
};