import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { translations } from '../../../../i18n/translations';
import { supabase } from '../../../../lib/supabase';
import { RecipeTemplates } from './RecipeTemplates';
import { SaveTemplateForm } from './SaveTemplateForm';

interface SendRecipeModalProps {
  showModal: boolean;
  onClose: () => void;
  record: any;
  onSuccess: () => Promise<void>;
}

interface RecipeTemplate {
  id: string;
  name: string;
  recipe: string;
  suggestions: string;
}

export const SendRecipeModal: React.FC<SendRecipeModalProps> = ({
  showModal,
  onClose,
  record,
  onSuccess
}) => {
  const { language } = useLanguageStore();
  const t = translations[language].users;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<RecipeTemplate[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [data, setData] = useState({
    recipe: record?.recipe || '',
    suggestions: record?.suggestions || ''
  });

  useEffect(() => {
    if (showModal) {
      fetchTemplates();
    }
  }, [showModal]);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: templates, error } = await supabase
        .from('recipe_templates')
        .select('*')
        .eq('dentist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateSelect = (template: RecipeTemplate) => {
    setData({
      recipe: template.recipe,
      suggestions: template.suggestions
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // First update the record with new recipe/suggestions
      const { error: updateError } = await supabase
        .from('patient_records')
        .update({
          recipe: data.recipe,
          suggestions: data.suggestions
        })
        .eq('id', record.id);

      if (updateError) throw updateError;

      // Save as template if checkbox is checked
      if (saveAsTemplate && templateName) {
        const { error: templateError } = await supabase
          .from('recipe_templates')
          .insert({
            dentist_id: user.id,
            name: templateName,
            recipe: data.recipe,
            suggestions: data.suggestions
          });

        if (templateError) throw templateError;
      }

      // Then send the recipe
      const { error: sendError } = await supabase.rpc('send_record_recipe', {
        record_id: record.id
      });

      if (sendError) throw sendError;

      await onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error sending recipe:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {t.sendRecipe}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Templates Section */}
          <RecipeTemplates
            templates={templates}
            onSelect={handleTemplateSelect}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.recipe}
            </label>
            <textarea
              value={data.recipe}
              onChange={(e) => setData({ ...data, recipe: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.recipePlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.suggestions}
            </label>
            <textarea
              value={data.suggestions}
              onChange={(e) => setData({ ...data, suggestions: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.suggestionsPlaceholder}
            />
          </div>

          {/* Save as Template Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveTemplate"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="saveTemplate" className="text-sm text-gray-700">
              {language === 'uz' ? 'Shablon sifatida saqlash' : 'Сохранить как шаблон'}
            </label>
          </div>

          {saveAsTemplate && (
            <SaveTemplateForm
              name={templateName}
              onNameChange={setTemplateName}
            />
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || (!data.recipe && !data.suggestions) || (saveAsTemplate && !templateName)}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? t.sending : t.sendRecipe}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};