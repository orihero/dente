import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { supabase } from '../../../../lib/supabase';
import { Switch } from '../../../../components/Switch';

interface AppointmentSettings {
  reminders: {
    enabled: boolean;
    hours_before: number;
    notify_dentist: boolean;
  };
}

interface AppointmentSettingsProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const AppointmentSettings: React.FC<AppointmentSettingsProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppointmentSettings>({
    reminders: {
      enabled: false,
      hours_before: 24,
      notify_dentist: true
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('dentists')
        .select('appointment_settings')
        .eq('id', dentistId)
        .single();

      if (error) throw error;
      
      if (data?.appointment_settings) {
        setSettings(data.appointment_settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: AppointmentSettings) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('dentists')
        .update({
          appointment_settings: newSettings
        })
        .eq('id', dentistId);

      if (error) throw error;
      
      setSettings(newSettings);
      await onRefresh();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h3 className="font-medium text-gray-900">
          {t.appointmentSettings}
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">
              {t.appointmentReminders}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {t.appointmentRemindersDescription}
            </p>
          </div>
          <Switch
            checked={settings.reminders.enabled}
            onChange={async (checked) => {
              const newSettings = {
                ...settings,
                reminders: {
                  ...settings.reminders,
                  enabled: checked
                }
              };
              await handleUpdateSettings(newSettings);
            }}
            disabled={loading}
          />
        </div>

        {settings.reminders.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.reminderHoursBefore}
              </label>
              <select
                value={settings.reminders.hours_before}
                onChange={(e) => {
                  const newSettings = {
                    ...settings,
                    reminders: {
                      ...settings.reminders,
                      hours_before: parseInt(e.target.value)
                    }
                  };
                  handleUpdateSettings(newSettings);
                }}
                disabled={loading}
                className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="1">1 {t.hour}</option>
                <option value="2">2 {t.hours}</option>
                <option value="3">3 {t.hours}</option>
                <option value="6">6 {t.hours}</option>
                <option value="12">12 {t.hours}</option>
                <option value="24">24 {t.hours}</option>
                <option value="48">48 {t.hours}</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">
                  {t.notifyDentist}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {t.notifyDentistDescription}
                </p>
              </div>
              <Switch
                checked={settings.reminders.notify_dentist}
                onChange={async (checked) => {
                  const newSettings = {
                    ...settings,
                    reminders: {
                      ...settings.reminders,
                      notify_dentist: checked
                    }
                  };
                  await handleUpdateSettings(newSettings);
                }}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};