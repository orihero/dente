import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';
import { supabase } from '../../../../lib/supabase';

interface EditFormProps {
  record: any;
  onCancel: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export const EditForm: React.FC<EditFormProps> = ({
  record,
  onCancel,
  onSubmit,
  loading
}) => {
  const { language } = useLanguageStore();
  const [data, setData] = useState({
    diagnosis: record?.diagnosis || '',
    total_price: record?.total_price || 0,
    recipe: record?.recipe || '',
    suggestions: record?.suggestions || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('patient_records')
        .update({
          diagnosis: data.diagnosis,
          total_price: data.total_price,
          recipe: data.recipe,
          suggestions: data.suggestions
        })
        .eq('id', record.id);

      if (error) throw error;
      await onSubmit(data);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'uz' ? 'Tashxis' : 'Диагноз'}
        </label>
        <textarea
          value={data.diagnosis}
          onChange={(e) => setData({ ...data, diagnosis: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'uz' ? 'Dori-darmonlar' : 'Лекарства'}
        </label>
        <textarea
          value={data.recipe}
          onChange={(e) => setData({ ...data, recipe: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={language === 'uz' 
            ? 'Dori-darmonlar va qo\'llash bo\'yicha ko\'rsatmalar'
            : 'Лекарства и инструкции по применению'
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'uz' ? 'Tavsiyalar' : 'Рекомендации'}
        </label>
        <textarea
          value={data.suggestions}
          onChange={(e) => setData({ ...data, suggestions: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={language === 'uz'
            ? 'Bemorga tavsiyalar'
            : 'Рекомендации пациенту'
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {language === 'uz' ? 'Umumiy narx' : 'Общая цена'}
        </label>
        <input
          type="number"
          value={data.total_price}
          onChange={(e) => setData({ ...data, total_price: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading 
            ? (language === 'uz' ? 'Saqlanmoqda...' : 'Сохранение...')
            : (language === 'uz' ? 'Saqlash' : 'Сохранить')}
        </button>
      </div>
    </form>
  );
};