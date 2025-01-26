import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { Header } from './Header';
import { EditForm } from './EditForm';
import { ViewDetails } from './ViewDetails';

interface RecordDetailsModalProps {
  showModal: boolean;
  onClose: () => void;
  record: any;
  onRefresh: () => Promise<void>;
}

export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({
  showModal,
  onClose,
  record,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showModal || !record) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Header
          record={record}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onClose={onClose}
          onDelete={async () => {
            setLoading(true);
            try {
              await onRefresh();
              onClose();
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
        />

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="p-4">
          {isEditing ? (
            <EditForm
              record={record}
              onCancel={() => setIsEditing(false)}
              onSubmit={async (data) => {
                setLoading(true);
                try {
                  await onRefresh();
                  setIsEditing(false);
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
            />
          ) : (
            <ViewDetails
              record={record}
              onRefresh={onRefresh}
            />
          )}
        </div>
      </div>
    </div>
  );
};