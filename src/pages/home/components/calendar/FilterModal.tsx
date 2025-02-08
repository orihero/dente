import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguageStore } from '../../../../store/languageStore';

interface FilterModalProps {
  show: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

export interface FilterOptions {
  status: ('pending' | 'confirmed' | 'cancelled' | 'completed')[];
  sortBy: 'time' | 'name';
  sortOrder: 'asc' | 'desc';
}

export const FilterModal: React.FC<FilterModalProps> = ({
  show,
  onClose,
  onApply,
  initialFilters
}) => {
  const { language } = useLanguageStore();
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  if (!show) return null;

  const statusOptions = [
    { value: 'pending', label: language === 'uz' ? 'Kutilmoqda' : 'Ожидается' },
    { value: 'confirmed', label: language === 'uz' ? 'Tasdiqlangan' : 'Подтверждён' },
    { value: 'cancelled', label: language === 'uz' ? 'Bekor qilingan' : 'Отменён' },
    { value: 'completed', label: language === 'uz' ? 'Yakunlangan' : 'Завершён' }
  ];

  const sortOptions = [
    { value: 'time', label: language === 'uz' ? 'Vaqt' : 'Время' },
    { value: 'name', label: language === 'uz' ? 'Ism' : 'Имя' }
  ];

  const handleStatusToggle = (status: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(filters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {language === 'uz' ? 'Filtrlash' : 'Фильтры'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Status Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Holat' : 'Статус'}
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(option.value as any)}
                    onChange={() => handleStatusToggle(option.value as any)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'uz' ? 'Saralash' : 'Сортировка'}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as 'time' | 'name'
                  }))}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    sortOrder: e.target.value as 'asc' | 'desc'
                  }))}
                  className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="asc">
                    {language === 'uz' ? 'O\'sish' : 'По возрастанию'}
                  </option>
                  <option value="desc">
                    {language === 'uz' ? 'Kamayish' : 'По убыванию'}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              {language === 'uz' ? 'Bekor qilish' : 'Отмена'}
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {language === 'uz' ? 'Qo\'llash' : 'Применить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};