"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import type { LoginProfile } from '@/lib/profiles';

interface LoginFormProps {
  sessionName: string;
  profiles: LoginProfile[];
  isLocal: boolean;
  autoEnter: boolean;
}

export default function LoginForm({ sessionName, profiles, isLocal, autoEnter }: LoginFormProps) {
  const router = useRouter();
  const [profileId, setProfileId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoFailed, setAutoFailed] = useState(false);
  const autoStarted = useRef(false);

  const selected = profiles.find((p) => p.id === profileId);
  const showAuto = autoEnter && !autoFailed;

  const finish = () => {
    router.replace('/');
    router.refresh();
  };

  const enterAsGm = async () => {
    setIsLoading(true);
    setError('');
    const result = await signIn('local-gm', { redirect: false });
    if (result?.error) {
      setAutoFailed(true);
      setIsLoading(false);
      setError('Não foi possível entrar como Mestre neste acesso.');
      return;
    }
    finish();
  };

  // Entrada automática do Mestre. O servidor revalida o acesso local; aqui só dispara.
  useEffect(() => {
    if (!showAuto || autoStarted.current) return;
    autoStarted.current = true;
    void enterAsGm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAuto]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profileId || isLoading) return;
    setIsLoading(true);
    setError('');
    const result = await signIn('profile', { profileId, password, redirect: false });
    if (result?.error) {
      setIsLoading(false);
      setError(
        selected?.requiresPassword
          ? 'Senha incorreta. Após várias tentativas o perfil fica bloqueado por alguns minutos.'
          : 'Não foi possível entrar. Tente novamente.'
      );
      return;
    }
    finish();
  };

  return (
    <main className="min-h-screen bg-[#0f172a] p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-md rounded-panel border-4 border-black bg-white shadow-hard-lg overflow-hidden">
        <header
          className="flex items-center gap-4 px-6 py-4 border-b-4 border-black text-white"
          style={{ backgroundColor: 'var(--theme-color)' }}
        >
          <span className="h-10 w-10 shrink-0 rounded-full border-4 border-white bg-cyan-400 shadow-glow" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-label font-extrabold uppercase">Trainer Card Pro</p>
            <h1 className="text-heading font-black uppercase truncate">{sessionName}</h1>
          </div>
        </header>

        <div className="p-6">
          {showAuto ? (
            <p role="status" className="text-body font-medium text-zinc-600 text-center py-6">
              Entrando como Mestre...
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {profiles.length === 0 ? (
                <p role="status" className="text-body font-medium text-zinc-600 rounded-inset border-2 border-zinc-200 bg-zinc-50 p-4">
                  O Mestre ainda não criou perfis. Peça para ele criar o seu no painel de administração.
                </p>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="profile" className="text-label font-extrabold uppercase" style={{ color: 'var(--theme-color)' }}>
                      Quem é você?
                    </label>
                    <select
                      id="profile"
                      value={profileId}
                      onChange={(e) => {
                        setProfileId(e.target.value);
                        setPassword('');
                        setError('');
                      }}
                      className="h-10 rounded-control border-2 border-black bg-white px-3 text-body font-extrabold italic text-zinc-900 shadow-hard-sm focus:outline-none"
                    >
                      <option value="">Escolha seu nome...</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.requiresPassword ? ' 🔒' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selected?.requiresPassword && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="password" className="text-label font-extrabold uppercase" style={{ color: 'var(--theme-color)' }}>
                        Senha
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-control border-2 border-black bg-white px-3 text-body font-extrabold text-zinc-900 shadow-hard-sm focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!profileId || isLoading}
                    className="h-12 rounded-control border-2 border-black text-label font-extrabold uppercase text-white shadow-hard-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--theme-color)' }}
                  >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="text-caption font-bold text-rose-600">
                  {error}
                </p>
              )}

              {isLocal && (
                <button
                  type="button"
                  onClick={enterAsGm}
                  disabled={isLoading}
                  className="h-10 rounded-control border-2 border-black bg-zinc-100 text-label font-extrabold uppercase text-zinc-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Entrar como Mestre (este computador)
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
