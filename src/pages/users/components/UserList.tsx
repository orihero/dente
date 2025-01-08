import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface User {
  id: string;
  full_name: string;
  phone: string;
  birthdate: string;
}

interface UserListProps {
  users: User[];
}

export const UserList: React.FC<UserListProps> = ({ users }) => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const t = translations[language].users;

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t.noUsers}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => navigate(`/users/${user.id}`)}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer"
        >
          <h3 className="font-medium text-gray-900 mb-2">
            {user.full_name}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{user.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {new Date(user.birthdate).toLocaleDateString(
                  language === 'uz' ? 'uz-UZ' : 'ru-RU'
                )}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};