"use client";

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import App from '../App';

// ────────────────────────────────────────────────────────────
// Partículas flutuantes de Pokébola (decorativas)
// ────────────────────────────────────────────────────────────
function FloatingPokeballs() {
  const pokeballs = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 14 + Math.random() * 22,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 10,
    opacity: 0.06 + Math.random() * 0.08,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pokeballs.map((pb) => (
        <div
          key={pb.id}
          className="absolute animate-float-pokeball"
          style={{
            width: pb.size,
            height: pb.size,
            left: `${pb.left}%`,
            bottom: '-40px',
            opacity: pb.opacity,
            animationDelay: `${pb.delay}s`,
            animationDuration: `${pb.duration}s`,
          }}
        >
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="currentColor" stroke="currentColor" strokeWidth="1" />
            <path d="M1 16 A 15 15 0 0 0 31 16" fill="rgba(255,255,255,0.4)" />
            <line x1="1" y1="16" x2="31" y2="16" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="4" fill="rgba(255,255,255,0.6)" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Tela de Login Manual — visual Pokédex
// ────────────────────────────────────────────────────────────
function LoginScreen() {
  const [trainerName, setTrainerName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'PLAYER' | 'GM'>('PLAYER');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!trainerName.trim()) return;
    setIsLoading(true);
    try {
      const res = await signIn('credentials', {
        username: trainerName.trim(),
        email: email.trim() || undefined,
        role: role,
        redirect: false,
      });

      if (res?.error) {
        setIsLoading(false);
        console.error('Erro de autenticação:', res.error);
      } else {
        // Recarrega a página atual preservando a URL (tunnel, IP ou localhost)
        window.location.reload();
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Falha ao realizar login:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-600/[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-amber-500/[0.04] blur-[80px] pointer-events-none" />

      <FloatingPokeballs />

      {/* Card principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Pokédex Header LED */}
        <div className="flex items-center gap-2 mb-4 ml-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.6)] animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]" />
        </div>

        <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/[0.08] rounded-[2rem] p-8 shadow-[0_0_60px_rgba(225,29,72,0.08),0_25px_50px_rgba(0,0,0,0.5)]">
          {/* Logo / Title */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              {/* Pokébola grande animada */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-rose-500 to-rose-600 border-[3px] border-zinc-700 shadow-[0_0_30px_rgba(225,29,72,0.3)] relative overflow-hidden animate-login-pokeball">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/90 rounded-b-full" />
                <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-zinc-700 -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-[3px] border-zinc-700 shadow-inner" />
                {/* Brilho */}
                <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-white/40" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-[0.15em] uppercase text-white mb-1">
              Trainer Card
              <span className="text-rose-500"> Pro</span>
            </h1>
            <p className="text-xs text-zinc-500 tracking-[0.3em] uppercase font-medium">
              Pokémon Tabletop United
            </p>
          </div>

          {/* Formulário de Login de Treinador */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 block ml-1">
                Nome do Treinador *
              </label>
              <input
                id="input-dev-name"
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Ex: Ash Ketchum"
                className="w-full px-4 py-3 bg-black/50 border border-zinc-700/60 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 block ml-1">
                E-mail (opcional)
              </label>
              <input
                id="input-dev-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ash@ketchum.com"
                className="w-full px-4 py-3 bg-black/50 border border-zinc-700/60 rounded-xl text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/30 transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1.5 block ml-1">
                Modo de Entrada
              </label>
              <div className="flex gap-2">
                <button
                  id="btn-role-player"
                  type="button"
                  onClick={() => setRole('PLAYER')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                    role === 'PLAYER'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.15)]'
                      : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:text-zinc-400 hover:border-zinc-600/60'
                  }`}
                >
                  <i className="fa-solid fa-user mr-1.5" />
                  Jogador
                </button>
                <button
                  id="btn-role-gm"
                  type="button"
                  onClick={() => setRole('GM')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border ${
                    role === 'GM'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                      : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-500 hover:text-zinc-400 hover:border-zinc-600/60'
                  }`}
                >
                  <i className="fa-solid fa-crown mr-1.5" />
                  Mestre (GM)
                </button>
              </div>
            </div>

            <button
              id="btn-dev-login"
              type="button"
              onClick={handleLogin}
              disabled={!trainerName.trim() || isLoading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-[0.97] text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <i className="fa-solid fa-right-to-bracket" />
              )}
              {isLoading ? 'Entrando...' : 'Entrar na Campanha'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-zinc-800/60 text-center">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Ficha sincronizada em tempo real com o servidor da campanha
            </p>
          </div>
        </div>

        {/* Pokédex bottom decoration */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="w-8 h-1 rounded-full bg-zinc-800" />
          <div className="w-2 h-2 rounded-full bg-zinc-800" />
          <div className="w-8 h-1 rounded-full bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Tela de Loading (enquanto verifica sessão)
// ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-rose-500 to-rose-600 border-[3px] border-zinc-700 shadow-[0_0_30px_rgba(225,29,72,0.3)] relative overflow-hidden animate-bounce-slow">
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white/90 rounded-b-full" />
          <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-zinc-700 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-[3px] border-zinc-700" />
          <div className="absolute top-1.5 left-2 w-2.5 h-2.5 rounded-full bg-white/40" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-zinc-400 text-sm font-medium tracking-wider animate-pulse">
          Carregando Pokédex...
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Page Component — Guard de sessão
// ────────────────────────────────────────────────────────────
export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <App />;
}
