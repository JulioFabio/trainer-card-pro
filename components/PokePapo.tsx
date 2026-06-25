import React, { useState } from 'react';
import { PokedexTheme } from '../constants';

interface PokePapoProps {
  isOpen: boolean;
  onClose: () => void;
  theme: PokedexTheme;
  children?: React.ReactNode; // Para renderizar o AttackCard ou outras mensagens dinâmicas
}

export const PokePapo: React.FC<PokePapoProps> = ({ isOpen, onClose, theme, children }) => {
  const [inputText, setInputText] = useState('');

  // Enviar comando/mensagem
  const handleSend = () => {
    if (!inputText.trim()) return;
    // Lógica futura de envio de mensagens
    setInputText('');
  };

  return (
    <div
      id="bandeja-chat"
      className={`relative z-10 h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] flex-shrink-0 ${
        isOpen ? 'w-[444px] -ml-16 opacity-100' : 'w-0 ml-0 opacity-0'
      }`}
    >
      <div
        className={`w-[444px] h-full border-[6px] border-l-0 rounded-r-[2.5rem] pt-4 pb-4 pr-4 pl-[72px] shadow-[10px_10px_20px_rgba(0,0,0,0.4)] flex flex-col transition-colors duration-500`}
        style={{
          backgroundColor: theme.color,
          borderColor: `${theme.color}dd`,
        }}
      >
        <div className="bg-zinc-50 flex-1 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div 
            className="relative text-white font-black italic tracking-widest text-center py-3.5 shadow-md flex justify-between items-center px-4 overflow-hidden z-10 shrink-0"
            style={{ backgroundColor: theme.color }}
          >
            <div className="absolute inset-0 bg-black/30 z-0"></div>
            <span className="text-xs z-10 tracking-widest">POKÉPAPO</span>
            <div className="flex items-center gap-3 z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse border border-white/20 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
                title="Fechar PokéPapo"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>
          </div>

          {/* Chat Body Area */}
          <div className="flex-1 p-3 overflow-y-auto bg-[#e5e7eb] flex flex-col gap-4 custom-scrollbar">
            <div className="text-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-200/80 px-3 py-1 rounded-full border border-gray-300 shadow-sm">
                Sessão Iniciada
              </span>
            </div>

            {/* Corpo de mensagens / rolagens */}
            <div className="flex-1 flex flex-col gap-4">
              {children || (
                <div className="self-end mr-1 w-full max-w-[280px]">
                  <span className="text-[10px] font-black uppercase tracking-wide text-gray-500 mb-1 block text-right">
                    Sistema:
                  </span>
                  <div className="bg-white border border-zinc-200/80 p-3.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-xs font-bold text-gray-600 leading-snug">
                    O chat lateral está pronto. Na próxima etapa, os rolagens e cartões de ataque serão mostrados aqui.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-zinc-100 border-t border-zinc-200/80 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] shrink-0">
            <div className="bg-white border border-zinc-200 rounded-xl flex p-1 shadow-sm items-center">
              <input
                type="text"
                placeholder="/roll 1d20 + 5"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-3 py-1.5 outline-none font-semibold text-gray-700 bg-transparent text-xs placeholder-gray-400"
              />
              <button
                onClick={handleSend}
                className={`${theme.main} text-white px-4 py-1.5 font-black text-[10px] rounded-lg hover:opacity-90 active:scale-95 uppercase tracking-widest transition-all shadow-md`}
              >
                Enviar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
