import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, Calendar, ChevronDown } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { translations } from '../../../i18n/translations';
import { supabase } from '../../../lib/supabase';

interface LoyaltyProgramsProps {
  dentistId: string;
  onRefresh: () => Promise<void>;
}

export const LoyaltyProgramsSection: React.FC<LoyaltyProgramsProps> = ({
  dentistId,
  onRefresh
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].profile;
  const [isExpanded, setIsExpanded] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [dentistId]);

  const fetchPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('dentist_id', dentistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error fetching loyalty programs:', error);
      setError(error.message);
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
            {t.loyaltyPrograms}
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
          <div className="flex justify-end mb-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
            >
              <Plus className="w-5 h-5" />
              <span>{t.addProgram}</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {programs.map((program) => (
              <div 
                key={program.id}
                className="bg-white border rounded-lg p-4 hover:border-indigo-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {language === 'uz' ? program.name_uz : program.name_ru}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'uz' ? program.description_uz : program.description_ru}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-indigo-600">
                      {program.percentage}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};