import React from 'react';
import { TrainerData } from '../types';

interface InfoFieldProps {
  label: string;
  value: string | number;
  field: keyof TrainerData;
  type?: string;
  onChange: (field: keyof TrainerData, value: string | number) => void;
  themeColor: string;
}

export const InfoField: React.FC<InfoFieldProps> = ({ label, value, field, type = "text", onChange, themeColor }) => (
  <div className="flex border-2 border-black rounded-xl overflow-hidden min-h-[2.5rem] h-auto group hover:brightness-110 transition-all shadow-[1px_1px_0px_rgba(0,0,0,0.1)] bg-white my-1">
    <div className="w-20 min-w-[5rem] flex items-center px-2 border-r-2 border-black border-dotted transition-colors duration-500" style={{ backgroundColor: themeColor }}>
      <span className="text-[9px] font-black italic uppercase text-white tracking-tighter drop-shadow-sm">{label}</span>
    </div>
    <div className="flex-1 flex items-center">
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(field, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)} 
        className="w-full bg-transparent px-2 text-xs font-black italic text-zinc-900 outline-none" 
      />
    </div>
  </div>
);
