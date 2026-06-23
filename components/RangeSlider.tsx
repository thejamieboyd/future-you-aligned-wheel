import React from 'react';

interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  colorClass: string; // e.g., 'accent-sky-500' (Not strictly needed with custom CSS but kept for reference)
  textColorClass: string; // e.g., 'text-sky-600' - Used for Label AND Thumb color
  trackColorClass: string; // e.g., 'bg-sky-100' - Used for Track background
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  colorClass,
  textColorClass,
  trackColorClass,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wider">
        <span className={textColorClass}>{label}</span>
        <span className={`${textColorClass} text-sm font-bold`}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        /* 
           Added textColorClass to the input: 
           This sets the 'color' property, which our CSS uses via 'background: currentColor' 
           to color the thumb (handle) appropriately.
        */
        className={`w-full h-2 rounded-lg ${trackColorClass} ${textColorClass} appearance-none focus:outline-none`}
      />
    </div>
  );
};