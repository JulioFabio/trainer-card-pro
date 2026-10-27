'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erro capturado no ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border-4 border-rose-500 rounded-[2rem] p-8 text-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border-2 border-rose-500/30">
          <i className="fa-solid fa-triangle-exclamation text-4xl animate-bounce"></i>
        </div>
        <h2 className="text-xl font-black uppercase tracking-widest text-rose-500 mb-2">
          Falha no Sistema Pokédex
        </h2>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Ocorreu um erro crítico durante a renderização do painel. Não se preocupe, seus dados do jogo estão protegidos.
        </p>
        
        <div className="bg-black/40 p-4 rounded-2xl text-left font-mono text-xs text-rose-400/80 mb-6 overflow-x-auto max-h-32 custom-scrollbar">
          {error.message || 'Erro de renderização desconhecido'}
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-zinc-700 active:scale-95"
          >
            Recarregar Página
          </button>
          <button
            onClick={() => reset()}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-500/20 active:scale-95"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
}
