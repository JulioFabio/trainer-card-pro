import React from 'react';

interface AttackCardProps {
  name: string;
  type: string;
  frequency: string;
  range: string;
  damage: string;
  category: 'Físico' | 'Especial' | 'Status';
  accuracy: string;
  db?: string | number;
  descriptor?: string;
  effect: string;
  onRollAccuracy?: () => void;
  onRollDamage?: () => void;
}

// Mapeamento de tipos para classes de cores do Tailwind (cor do cabeçalho)
const TYPE_BG_CLASSES: Record<string, string> = {
  'NORMAL': 'bg-gray-400 text-zinc-900',
  'LUTADOR': 'bg-red-700 text-white',
  'VOADOR': 'bg-sky-400 text-zinc-900',
  'VENENOSO': 'bg-purple-600 text-white',
  'TERRESTRE': 'bg-amber-700 text-white',
  'PEDRA': 'bg-yellow-800 text-white',
  'INSETO': 'bg-lime-600 text-zinc-900',
  'FANTASMA': 'bg-indigo-700 text-white',
  'AÇO': 'bg-zinc-500 text-white',
  'FOGO': 'bg-orange-500 text-white',
  'ÁGUA': 'bg-blue-500 text-white',
  'PLANTA': 'bg-green-600 text-white',
  'ELÉTRICO': 'bg-yellow-500 text-zinc-900',
  'PSÍQUICO': 'bg-pink-500 text-white',
  'GELO': 'bg-cyan-300 text-zinc-900',
  'DRAGÃO': 'bg-indigo-900 text-white',
  'SOMBRIO': 'bg-gray-800 text-white',
  'FADA': 'bg-pink-300 text-zinc-900',
  'CRISTAL': 'bg-purple-400 text-zinc-900',
};

export const AttackCard: React.FC<AttackCardProps> = ({
  name,
  type,
  frequency,
  range,
  damage,
  category,
  accuracy,
  db = '-',
  descriptor = '-',
  effect,
  onRollAccuracy,
  onRollDamage,
}) => {
  const normalizedType = type.toUpperCase().trim();
  const bgClass = TYPE_BG_CLASSES[normalizedType] || 'bg-gray-700 text-white';

  return (
    <div className="w-full max-w-[280px]">
      <div className="border-[3px] border-black bg-white flex flex-col font-sans text-black w-full shadow-md transform hover:scale-[1.02] transition-transform cursor-pointer rounded-none">
        
        {/* Cabeçalho */}
        <div className={`${bgClass} text-center font-bold italic py-1 border-b-[3px] border-black text-lg tracking-wide shadow-inner`}>
          {name}
        </div>

        {/* Linha 1: Precisão / DB */}
        <div className="grid grid-cols-2 text-center border-b-[3px] border-black text-[11px] font-black bg-gray-50">
          <div className="py-1.5 border-r-[3px] border-black" title="Acurácia (AC)">
            AC: {accuracy || '-'}
          </div>
          <div className="py-1.5" title="Damage Base (DB)">
            DB: {db || '-'}
          </div>
        </div>

        {/* Linha 2: Frequência / Alcance */}
        <div className="grid grid-cols-2 text-center border-b-[3px] border-black text-[11px] font-black bg-white">
          <div className="py-1.5 border-r-[3px] border-black">
            {frequency}
          </div>
          <div className="py-1.5 flex items-center justify-center leading-none px-1 text-[10px]">
            {range}
          </div>
        </div>

        {/* Linha 3: Tipo / Descritor */}
        <div className="grid grid-cols-2 text-center border-b-[3px] border-black text-[11px] font-black bg-gray-50">
          <div className="py-1.5 border-r-[3px] border-black">
            {type}
          </div>
          <div className="py-1.5 truncate px-1">
            {descriptor}
          </div>
        </div>

        {/* Linha 4: Dano + Categoria */}
        <div className="text-center py-2 border-b-[3px] border-black font-black text-sm bg-white">
          {damage} {category}
        </div>

        {/* Descrição do Efeito */}
        <div className="p-3 text-center text-[10px] font-bold min-h-[90px] flex items-center justify-center bg-gray-50 leading-snug">
          {effect || 'Sem efeitos adicionais.'}
        </div>
      </div>
      
      {/* Botões acoplados */}
      <div className="flex gap-2 mt-2 justify-end w-full">
        <button
          onClick={onRollAccuracy}
          className="flex-1 bg-blue-600 hover:bg-blue-500 border-2 border-gray-800 text-white text-[9px] font-black uppercase tracking-widest py-1.5 rounded active:scale-95 transition-all shadow-sm"
        >
          Rolar Acurácia
        </button>
        <button
          onClick={onRollDamage}
          className="flex-1 bg-rose-600 hover:bg-rose-500 border-2 border-gray-800 text-white text-[9px] font-black uppercase tracking-widest py-1.5 rounded active:scale-95 transition-all shadow-sm"
        >
          Rolar Dano
        </button>
      </div>
    </div>
  );
};
