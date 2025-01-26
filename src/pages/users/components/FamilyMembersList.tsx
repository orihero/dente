import React from 'react';
import { Phone, Calendar } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface FamilyMember {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
  relationship: string;
}

interface FamilyMembersListProps {
  members: FamilyMember[];
  onRefresh: () => Promise<void>;
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ members }) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noFamilyMembers}
      </div>
    );
  }

  const getRelationshipLabel = (relationship: string) => {
    const relationships: Record<string, string> = {
      mother: t.mother,
      father: t.father,
      spouse: t.spouse,
      child: t.child,
      sibling: t.sibling,
      other: t.other
    };
    return relationships[relationship] || relationship;
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as +998 XX XXX XX XX for display
    const digits = phone.replace(/\D/g, '');
    let formatted = '';
    if (digits.length > 0) formatted += '+' + digits.substring(0, 3); // +998
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    if (digits.length > 10) formatted += ' ' + digits.substring(10, 12);
    return formatted;
  };

  return (
    <div className="divide-y divide-gray-200">
      {members.map((member) => (
        <div key={member.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">
                {member.full_name}
              </h4>
              <p className="text-sm text-indigo-600">
                {getRelationshipLabel(member.relationship)}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span className="text-sm">{formatPhoneNumber(member.phone)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {new Date(member.birthdate).toLocaleDateString(
                    language === 'uz' ? 'uz-UZ' : 'ru-RU'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};