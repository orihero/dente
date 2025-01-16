import React from 'react';
import { LogOut } from 'lucide-react';

interface ProfileHeaderProps {
  onSignOut: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onSignOut }) => {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600">Dente.uz</h1>
          <button
            onClick={onSignOut}
            className="text-gray-500 hover:text-gray-700"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};