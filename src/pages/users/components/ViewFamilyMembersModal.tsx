import React from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { FamilyMembersList } from './FamilyMembersList';

interface ViewFamilyMembersModalProps {
  showModal: boolean;
  onClose: () => void;
  members: any[];
  onRefresh: () => Promise<void>;
}

export const ViewFamilyMembersModal: React.FC<ViewFamilyMembersModalProps> = ({
  showModal,
  onClose,
  members,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{t.familyMembers}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <FamilyMembersList members={members} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
};