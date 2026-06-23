import React from 'react';
import { CategoryData, GapInsight } from '../types';

interface AnalysisReportProps {
  data: CategoryData[];
}

export const AnalysisReport: React.FC<AnalysisReportProps> = ({ data }) => {
  // Calculate gaps: Importance - Satisfaction
  // Filter for positive gaps (Importance > Satisfaction)
  const gaps: GapInsight[] = data
    .map((cat) => ({
      categoryName: cat.name,
      gap: cat.importance - cat.satisfaction,
    }))
    .filter((item) => item.gap > 0)
    .sort((a, b) => b.gap - a.gap) // Sort descending
    .slice(0, 3); // Take top 3

  if (gaps.length === 0) {
    return (
      <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
        <h3 className="text-xl font-medium text-emerald-800 mb-2">You are aligned!</h3>
        <p className="text-emerald-700">
          Your current satisfaction matches or exceeds the importance you place on these areas. 
          Great job maintaining balance.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4 px-2">Gap Analysis Report</h3>
      <div className="grid gap-4">
        {gaps.map((item, index) => (
          <div 
            key={index} 
            className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <p className="text-slate-700 font-medium">
              Future You is asking for attention in <span className="font-bold text-slate-900">{item.categoryName}</span>.
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide whitespace-nowrap">
              Gap: +{item.gap}
            </span>
          </div>
        ))}
      </div>
      <p className="text-slate-400 text-sm mt-4 px-2 italic">
        * These are your primary "Friction Areas" where intended focus exceeds current reality.
      </p>
    </div>
  );
};