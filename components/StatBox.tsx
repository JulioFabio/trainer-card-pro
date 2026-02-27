
import React from 'react';
import { MIN_STAT, MAX_STAT_INITIAL, STAT_COLORS, STAT_LABELS } from '../constants';

interface StatBoxProps {
  statKey: string;
  value: number;
  themeTextColor: string;
  onChange: (key: string, value: number) => void;
}

const StatBox: React.FC<StatBoxProps> = ({ statKey, value, themeTextColor, onChange }) => {
  const label = STAT_LABELS[statKey];
  const colorClass = STAT_COLORS[statKey];
  
  const percentage = Math.min((value / MAX_STAT_INITIAL) * 100, 100);

  return (
    <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <input
          type="number"
          min={MIN_STAT}
          value={value}
          onChange={(e) => onChange(statKey, parseInt(e.target.value) || MIN_STAT)}
          className={`w-12 text-center font-bold ${themeTextColor} bg-slate-50 border border-slate-200 rounded-md py-1 focus:ring-2 focus:outline-none transition-all`}
        />
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out shadow-inner`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default StatBox;
