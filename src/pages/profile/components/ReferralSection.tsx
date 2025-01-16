import React, { useState, useEffect } from 'react';
import { ChevronDown, Copy, Share2 } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';

interface ReferralSectionProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [isExpanded, setIsExpanded] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchLeads();
    }
  }, [isExpanded]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('referred_by', dentistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const referralLink = `https://dente.uz/refer/${dentistId}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleShare = async () => {
    const referralLink = `https://dente.uz/refer/${dentistId}`;
    const shareData = {
      title: language === 'uz' ? 'Dente.uz tavsiyasi' : 'Рекомендация Dente.uz',
      text: language === 'uz' 
        ? 'Dente.uz - stomatologiya klinikasi uchun zamonaviy boshqaruv tizimi'
        : 'Dente.uz - современная система управления для стоматологической клиники',
      url: referralLink
    };

    try {
      // Check if Web Share API is supported and available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await handleCopyLink();
      }
    } catch (error) {
      // If sharing fails (e.g., user cancels), just log it
      console.log('Share cancelled or failed:', error);
    }
  };

  return (
    <div className="border-t border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {language === 'uz' ? 'Yo\'llash dasturi' : 'Реферальная программа'}
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
            {/* Referral Link Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {language === 'uz' ? 'Sizning yo\'llash havolangiz' : 'Ваша реферальная ссылка'}
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`https://dente.uz/refer/${dentistId}`}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-white"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-2">
                  {language === 'uz' ? 'Havola nusxalandi!' : 'Ссылка скопирована!'}
                </p>
              )}
            </div>

            {/* Leads List */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                {language === 'uz' ? 'Yo\'llangan shifokorlar' : 'Направленные врачи'}
              </h4>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{lead.full_name}</h5>
                          <p className="text-sm text-gray-600">{lead.phone}</p>
                          {lead.email && (
                            <p className="text-sm text-gray-600">{lead.email}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'converted'
                              ? 'bg-green-100 text-green-800'
                              : lead.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {lead.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {language === 'uz' 
                    ? 'Hali hech kim yo\'llanmagan' 
                    : 'Пока никто не направлен'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};