import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { supabase } from '../../../../lib/supabase';

interface MessageTemplatesSectionProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const MessageTemplatesSection: React.FC<MessageTemplatesSectionProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({
    appointment: {
      sms: {
        uz: '',
        ru: ''
      },
      telegram: {
        uz: '',
        ru: ''
      }
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('dentists')
        .select('message_templates')
        .eq('id', dentistId)
        .single();

      if (error) throw error;
      
      if (data?.message_templates) {
        setTemplates(data.message_templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleUpdateTemplates = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('dentists')
        .update({
          message_templates: templates
        })
        .eq('id', dentistId);

      if (error) throw error;
      await onRefresh();
    } catch (error) {
      console.error('Error updating templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-600" />
        <h3 className="font-medium text-gray-900">
          {language === 'uz' ? 'Xabar shablonlari' : 'Шаблоны сообщений'}
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            {language === 'uz' ? 'Qabul uchun xabarlar' : 'Сообщения для приёма'}
          </h4>
          
          <div className="space-y-6">
            {/* SMS Templates */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                SMS
              </h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">O'zbekcha</label>
                  <textarea
                    value={templates.appointment.sms.uz}
                    onChange={(e) => setTemplates({
                      ...templates,
                      appointment: {
                        ...templates.appointment,
                        sms: {
                          ...templates.appointment.sms,
                          uz: e.target.value
                        }
                      }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Русский</label>
                  <textarea
                    value={templates.appointment.sms.ru}
                    onChange={(e) => setTemplates({
                      ...templates,
                      appointment: {
                        ...templates.appointment,
                        sms: {
                          ...templates.appointment.sms,
                          ru: e.target.value
                        }
                      }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}."
                  />
                </div>
              </div>
            </div>

            {/* Telegram Templates */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Telegram
              </h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">O'zbekcha</label>
                  <textarea
                    value={templates.appointment.telegram.uz}
                    onChange={(e) => setTemplates({
                      ...templates,
                      appointment: {
                        ...templates.appointment,
                        telegram: {
                          ...templates.appointment.telegram,
                          uz: e.target.value
                        }
                      }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Hurmatli {{patient_name}}, sizning qabulingiz {{dentist_name}} shifokor bilan {{date}} kuni soat {{time}} da belgilandi."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Русский</label>
                  <textarea
                    value={templates.appointment.telegram.ru}
                    onChange={(e) => setTemplates({
                      ...templates,
                      appointment: {
                        ...templates.appointment,
                        telegram: {
                          ...templates.appointment.telegram,
                          ru: e.target.value
                        }
                      }
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Уважаемый(ая) {{patient_name}}, ваш приём у врача {{dentist_name}} назначен на {{date}} в {{time}}."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUpdateTemplates}
              disabled={loading}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading 
                ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};