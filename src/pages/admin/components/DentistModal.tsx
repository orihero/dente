import React from 'react';
import { SlideModal } from './SlideModal';
import { DentistForm } from './DentistForm';
import { useLanguageStore } from '../../../store/languageStore';

interface DentistModalProps {
  showModal: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  loading: boolean;
  dentist?: any;
  clinics: any[];
}

export const DentistModal: React.FC<DentistModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  loading,
  dentist,
  clinics
}) => {
  const { language } = useLanguageStore();

  const title = dentist
    ? (language === 'uz' ? 'Shifokorni tahrirlash' : 'Редактировать врача')
    : (language === 'uz' ? 'Yangi shifokor' : 'Новый врач');

  return (
    <SlideModal
      show={showModal}
      onClose={onClose}
      title={title}
    >
      <DentistForm
        dentist={dentist}
        clinics={clinics}
        onSubmit={onSubmit}
        loading={loading}
      />
    </SlideModal>
  );
};