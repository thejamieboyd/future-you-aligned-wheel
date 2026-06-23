import React from 'react';
import { ReflectionData } from '../types';

interface ReflectionSectionProps {
  reflections: ReflectionData;
  onChange: (field: keyof ReflectionData, value: string) => void;
}

export const ReflectionSection: React.FC<ReflectionSectionProps> = ({ reflections, onChange }) => {
  const prompts = [
    {
      id: 'friction' as keyof ReflectionData,
      label: 'The Friction',
      question: 'What stands out when you look at your numbers? (Look for the high gaps).',
    },
    {
      id: 'anchors' as keyof ReflectionData,
      label: 'The Anchors',
      question: 'Which areas feel strongest right now? (These are your anchors).',
    },
    {
      id: 'neglect' as keyof ReflectionData,
      label: 'The Neglect',
      question: 'Which areas feel neglected or drained?',
    },
    {
      id: 'shift' as keyof ReflectionData,
      label: 'The Shift',
      question: 'What would a small improvement look like in the lowest-rated area?',
    },
    {
      id: 'tradeoff' as keyof ReflectionData,
      label: 'The Trade-Off',
      question: 'What can I adjust, delegate, or pause this season?',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 mt-8 break-inside-avoid">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl font-medium text-slate-800 mb-2">Decode Your Data</h2>
        <p className="text-slate-500 text-sm sm:text-base">
          What is the story here? Now that you see the gap, let’s name it. Don't judge the low scores—just notice them.
        </p>
      </div>

      <div className="grid gap-8">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="space-y-2 break-inside-avoid">
            <label htmlFor={prompt.id} className="block text-slate-800 font-semibold text-lg">
              {prompt.label}
            </label>
            <p className="text-slate-500 text-sm mb-2">{prompt.question}</p>
            
            {/* Screen Input: Textarea (Hidden on Print) */}
            <textarea
              id={prompt.id}
              value={reflections[prompt.id]}
              onChange={(e) => onChange(prompt.id, e.target.value)}
              placeholder="Write your reflection here..."
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all resize-y no-print"
            />

            {/* Print Output: Static Div (Visible only on Print) */}
            <div className="print-only w-full min-h-[4rem] p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-base leading-relaxed whitespace-pre-wrap">
              {reflections[prompt.id] || '(No reflection recorded)'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};