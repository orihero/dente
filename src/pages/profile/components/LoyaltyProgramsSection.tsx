import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Calendar, ChevronDown, Gift } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name_uz: '',
    name_ru: '',
    description_uz: '',
    description_ru: '',
    start_date: '',
    end_date: '',
    percentage: '',
    enabled: true
  });

  useEffect(() => {
    if (isExpanded) {
      fetchPrograms();
    }
  }, [isExpanded]);

  const fetchPrograms = async () => {
    try {
      setError(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('loyalty_programs')
        .insert({
          dentist_id: dentistId,
          ...formData,
          percentage: parseFloat(formData.percentage)
        });

      if (error) throw error;

      await fetchPrograms();
      setShowAddForm(false);
      setFormData({
        name_uz: '',
        name_ru: '',
        description_uz: '',
        description_ru: '',
        start_date: '',
        end_date: '',
        percentage: '',
        enabled: true
      });
    } catch (error: any) {
      console.error('Error creating loyalty program:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProgram = async (programId: string, enabled: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('loyalty_programs')
        .update({ enabled })
        .eq('id', programId);

      if (error) throw error;
      await fetchPrograms();
    } catch (error: any) {
      console.error('Error updating loyalty program:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-medium text-gray-900">
              {t.loyaltyPrograms}
            </h3>
          </div>
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
              onClick={() => setShowAddForm(true)}
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

          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Nomi (O\'zbekcha)' : 'Название (Узбекский)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_uz}
                    onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Nomi (Ruscha)' : 'Название (Русский)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_ru}
                    onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Tavsif (O\'zbekcha)' : 'Описание (Узбекский)'}
                  </label>
                  <textarea
                    value={formData.description_uz}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Tavsif (Ruscha)' : 'Описание (Русский)'}
                  </label>
                  <textarea
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Boshlanish sanasi' : 'Дата начала'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Tugash sanasi' : 'Дата окончания'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'uz' ? 'Chegirma foizi' : 'Процент скидки'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading 
                    ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
                    : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
                </button>
              </div>
            </form>
          ) : (
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
                      <div className="mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={program.enabled}
                            onChange={(e) => handleToggleProgram(program.id, e.target.checked)}
                            className="sr-only peer"
                            disabled={loading}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {program.enabled 
                              ? (language === 'uz' ? 'Faol' : 'Активна')
                              : (language === 'uz' ? 'Faol emas' : 'Неактивна')}
                          </span>
                        </label>
                      </div>
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
          )}
        </div>
      )}
    </div>
  );
};