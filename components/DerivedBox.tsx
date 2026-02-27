import React from 'react';

interface DerivedBoxProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export const DerivedBox: React.FC<DerivedBoxProps> = ({ label, value, icon, color }) => (
  <div className="bg-white border-2 border-black rounded-2xl overflow-hidden flex items-center p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.1)] group hover:scale-105 transition-transform">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-inner" style={{ backgroundColor: color }}>
      <i className={`fa-solid ${icon} text-[10px]`} />
    </div>
    <div className="flex-1 px-3">
      <div className="text-[8px] font-black uppercase text-zinc-400 mb-[-2px] tracking-widest">{label}</div>
      <div className="w-full font-black text-xl text-zinc-900">{value}</div>
    </div>
  </div>
);
