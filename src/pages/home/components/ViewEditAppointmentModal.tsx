import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';

interface ViewEditAppointmentModalProps {
  showModal: boolean;
  onClose: () => void;
  appointment: any;
  onUpdate: (data: any) => Promise<void>;
  onDelete: () => Promise<void>;
  loading: boolean;
}

export const ViewEditAppointmentModal: React.FC<ViewEditAppointmentModalProps> = ({
  showModal,
  onClose,
  appointment,
  onUpdate,
  onDelete,
  loading
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].home;
  const [isEditing, setIsEditing] = useState(true);
  const [data, setData] = useState({
    appointment_date: new Date(appointment?.appointment_time).toISOString().split('T')[0],
    appointment_time: new Date(appointment?.appointment_time).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    notes: appointment?.notes || ''
  });

  if (!showModal || !appointment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentTime = new Date(data.appointment_date + 'T' + data.appointment_time);
    await onUpdate({
      ...appointment,
      appointment_time: appointmentTime.toISOString(),
      notes: data.notes
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? t.editAppointment : t.viewAppointment}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    required
                    value={data.appointment_date}
                    onChange={(e) => setData({ ...data, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.time}
                  </label>
                  <input
                    type="time"
                    required
                    value={data.appointment_time}
                    onChange={(e) => setData({ ...data, appointment_time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? t.saving : t.save}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {appointment.patient.full_name}
                </h3>
                <p className="text-sm text-gray-500">{appointment.patient.phone}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.date}</p>
                  <p className="mt-1">
                    {new Date(appointment.appointment_time).toLocaleDateString(
                      language === 'uz' ? 'uz-UZ' : 'ru-RU'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.time}</p>
                  <p className="mt-1">
                    {new Date(appointment.appointment_time).toLocaleTimeString(
                      language === 'uz' ? 'uz-UZ' : 'ru-RU',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
              </div>
              {appointment.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">{t.notes}</p>
                  <p className="mt-1 text-gray-700">{appointment.notes}</p>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {t.edit}
                </button>
                <button
                  onClick={onDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? t.deleting : t.delete}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};