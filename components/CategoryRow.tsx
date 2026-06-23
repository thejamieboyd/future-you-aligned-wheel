import React from 'react';
import { CategoryData, UpdateField } from '../types';
import { RangeSlider } from './RangeSlider';

interface CategoryRowProps {
  category: CategoryData;
  onUpdate: (id: string, field: UpdateField, value: string | number) => void;
  onDelete: (id: string) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ category, onUpdate, onDelete }) => {
  return (
    <div className="relative bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 group">
      {/* Delete Button */}
      <button
        onClick={() => onDelete(category.id)}
        className="absolute top-4 right-4 text-slate-300 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50"
        title="Delete category"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Category Name Input */}
      <div className="mb-4 pr-8">
        <input
          type="text"
          value={category.name}
          onChange={(e) => onUpdate(category.id, 'name', e.target.value)}
          className="w-full text-lg font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none transition-colors pb-1"
          placeholder="Category Name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Satisfaction Slider (Blue) */}
        <RangeSlider
          label="Satisfaction"
          value={category.satisfaction}
          onChange={(val) => onUpdate(category.id, 'satisfaction', val)}
          colorClass="accent-sky-500"
          textColorClass="text-sky-600"
          trackColorClass="bg-sky-100"
        />

        {/* Importance Slider (Orange) */}
        <RangeSlider
          label="Importance"
          value={category.importance}
          onChange={(val) => onUpdate(category.id, 'importance', val)}
          colorClass="accent-orange-500"
          textColorClass="text-orange-600"
          trackColorClass="bg-orange-100"
        />
      </div>
    </div>
  );
};