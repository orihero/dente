import React, { useState, useEffect } from 'react';
import { Bot, Copy, ExternalLink } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { supabase } from '../../../../lib/supabase';
import { Switch } from '../../../../components/Switch';

interface TelegramBotSettingsProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const TelegramBotSettings: React.FC<TelegramBotSettingsProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [settings, setSettings] = useState({
    enabled: false,
    loyalty: {
      birthday: {
        enabled: false,
        days_before: 0,
        days_after: 0,
        percentage: 0
      }
    },
    referral: {
      enabled: false,
      percentage: 0,
      days_active: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('dentists')
        .select('telegram_bot_settings, telegram_bot_registered, telegram_registration_token, telegram_link')
        .eq('id', dentistId)
        .maybeSingle();

      if (error) throw error;
      
      setSettings(data?.telegram_bot_settings || {
        enabled: false,
        loyalty: {
          birthday: {
            enabled: false,
            days_before: 0,
            days_after: 0,
            percentage: 0
          }
        },
        referral: {
          enabled: false,
          percentage: 0,
          days_active: 0
        }
      });
      setRegistrationToken(data?.telegram_registration_token);
      setTelegramLink(data?.telegram_link);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      setLoading(true);
      
      const { error: updateError } = await supabase
        .from('dentists')
        .update({
          telegram_bot_settings: newSettings
        })
        .eq('id', dentistId);

      if (updateError) throw updateError;
      
      setSettings(newSettings);
      await onRefresh();

      // If enabling the bot and no link exists, generate one
      if (newSettings.enabled && !telegramLink) {
        await generateToken();
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async () => {
    try {
      setLoading(true);
      
      // First, enable the bot if not already enabled
      if (!settings.enabled) {
        const newSettings = { ...settings, enabled: true };
        const { error: updateError } = await supabase
          .from('dentists')
          .update({
            telegram_bot_settings: newSettings
          })
          .eq('id', dentistId);

        if (updateError) throw updateError;
        setSettings(newSettings);
      }

      // Generate token and link
      const { data: link, error } = await supabase
        .rpc('generate_telegram_link', {
          dentist_id: dentistId
        });

      if (error) throw error;
      
      // Fetch updated settings to get the new link
      await fetchSettings();
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!telegramLink) return;
    
    try {
      await navigator.clipboard.writeText(telegramLink);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-600" />
        <h3 className="font-medium text-gray-900">
          {t.telegramBot}
        </h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <span className="font-medium">{t.botEnabled}</span>
          </div>
          <Switch
            checked={settings.enabled}
            onChange={async (checked) => {
              const newSettings = { ...settings, enabled: checked };
              await handleUpdateSettings(newSettings);
            }}
            disabled={loading}
          />
        </div>

        {settings.enabled && (
          <div className="space-y-6">
            {/* Token Generation */}
            <div className="border-t pt-4">
              <div className="space-y-4">
                {telegramLink ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={telegramLink}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                    />
                    <button
                      onClick={copyLink}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={generateToken}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? '...' : t.generateToken}
                  </button>
                )}

                {tokenCopied && (
                  <p className="text-sm text-green-600">{t.tokenCopied}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};