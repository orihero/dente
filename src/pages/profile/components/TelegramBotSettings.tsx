import React, { useState, useEffect } from 'react';
import { Bot, Copy, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';
import { Switch } from '../../../components/Switch';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [dentistId]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('dentists')
        .select('telegram_bot_settings, telegram_bot_registered, telegram_registration_token')
        .eq('id', dentistId)
        .single();

      if (error) throw error;
      
      setSettings(data.telegram_bot_settings || {
        enabled: false
      });
      setRegistrationToken(data.telegram_registration_token);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const generateToken = async () => {
    try {
      setLoading(true);
      
      // First, enable the bot
      const { error: updateError } = await supabase
        .from('dentists')
        .update({
          telegram_bot_settings: { ...settings, enabled: true }
        })
        .eq('id', dentistId);

      if (updateError) throw updateError;

      // Then generate token
      const { data, error } = await supabase
        .rpc('generate_telegram_registration_token', {
          dentist_id: dentistId
        });

      if (error) throw error;
      
      // Fetch updated settings to get the new token
      await fetchSettings();
    } catch (error) {
      console.error('Error generating token:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = async () => {
    if (!registrationToken) return;
    
    try {
      const botLink = `https://t.me/denteuzbot?start=${registrationToken}`;
      await navigator.clipboard.writeText(botLink);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (error) {
      console.error('Error copying token:', error);
    }
  };

  if (!settings) return null;

  return (
    <div className="border-t border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {t.telegramBot}
          </h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 pt-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">{t.botEnabled}</span>
              </div>
              <Switch
                checked={settings.enabled || false}
                onChange={async (checked) => {
                  const newSettings = { ...settings, enabled: checked };
                  await updateSettings(newSettings);
                }}
              />
            </div>

            {settings.enabled && (
              <div className="space-y-6">
                {/* Token Generation */}
                <div className="border-t pt-4">
                  <div className="space-y-4">
                    {registrationToken ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`https://t.me/denteuzbot?start=${registrationToken}`}
                          readOnly
                          className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
                        />
                        <button
                          onClick={copyToken}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
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
      )}
    </div>
  );
};