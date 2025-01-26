import React from 'react';
import { X, Edit2, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { formatDateTime } from '../../../../utils/dateUtils';

interface HeaderProps {
  record: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onClose: () => void;
  onDelete: () => Promise<void>;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  record,
  isEditing,
  setIsEditing,
  onClose,
  onDelete,
  loading
}) => {
  const { language } = useLanguageStore();
  const formatRecordNumber = (num: number) => String(num).padStart(6, '0');

  return (
    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
      <div>
        <h2 className="text-lg font-semibold">
          Record #{formatRecordNumber(record.record_number)}
        </h2>
        <p className="text-sm text-gray-500">
          {formatDateTime(record.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              disabled={loading}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};