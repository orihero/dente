import React from 'react';
import { useLanguageStore } from '../../../../store/languageStore';

interface RecipeTemplate {
  id: string;
  name: string;
  recipe: string;
  suggestions: string;
}

interface RecipeTemplatesProps {
  templates: RecipeTemplate[];
  onSelect: (template: RecipeTemplate) => void;
}

export const RecipeTemplates: React.FC<RecipeTemplatesProps> = ({
  templates,
  onSelect
}) => {
  const { language } = useLanguageStore();

  if (templates.length === 0) return null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {language === 'uz' ? 'Shablonlar' : 'Шаблоны'}
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {templates.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="text-left text-sm px-2 py-1.5 border rounded hover:bg-gray-50 transition-colors truncate"
          >
            {template.name}
          </button>
        ))}
      </div>
    </div>
  );
};