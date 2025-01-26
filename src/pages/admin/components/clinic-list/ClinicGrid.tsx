import React from 'react';
import { ClinicCard } from './ClinicCard';

interface ClinicGridProps {
  clinics: any[];
  onEditClinic: (clinic: any) => void;
}

export const ClinicGrid: React.FC<ClinicGridProps> = ({ clinics, onEditClinic }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinics.map((clinic) => (
        <ClinicCard
          key={clinic.id}
          clinic={clinic}
          onEdit={() => onEditClinic(clinic)}
        />
      ))}
    </div>
  );
};