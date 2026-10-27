"use client";

import React, { useState, useTransition } from 'react';
import {
  createProfileAction,
  removeProfileAction,
  renameProfileAction,
  setMasterPasswordAction,
  setProfilePasswordAction,
  setSessionNameAction,
  type ActionResult,
} from './actions';

export interface AdminProfile {
  id: string;
  name: string;
  hasPassword: boolean;
  characterCount: number;
}

interface ProfilesPanelProps {
  sessionName: string;
  hasMasterPassword: boolean;
  profiles: AdminProfile[];
}

const inputClass =
  'h-10 rounded-control border-2 border-black bg-white px-3 text-body font-extrabold text-zinc-900 shadow-hard-sm focus:outline-none';
const buttonClass =
  'h-8 rounded-sm border-2 border-black bg-zinc-100 px-3 text-label font-extrabold uppercase text-zinc-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer';
const primaryButtonClass =
  'h-10 rounded-control border-2 border-black px-4 text-label font-extrabold uppercase text-white shadow-hard-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer';
const labelClass = 'text-label font-extrabold uppercase';

export default function ProfilesPanel({ sessionName, hasMasterPassword, profiles }: ProfilesPanelProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const [sessionDraft, setSessionDraft] = useState(sessionName);
  const [masterPassword, setMasterPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [passwordFor, setPasswordFor] = useState<{ id: string; value: string } | null>(null);

  const run = (task: () => Promise<ActionResult>, okText: string, onOk?: () => void) => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        if (result.success) {
          setMessage({ kind: 'ok', text: okText });
          onOk?.();
        } else {
          setMessage({ kind: 'error', text: result.error });
        }
      } catch {
        setMessage({ kind: 'error', text: 'Não foi possível concluir a operação.' });
      }
    });
  };

  const themeBg = { backgroundColor: 'var(--theme-color)' };
  const themeText = { color: 'var(--theme-color)' };

  return (
    <section className="mb-8 rounded-panel border-4 border-black bg-white p-6 text-zinc-900 shadow-hard-lg">
      <h2 className="text-heading font-black uppercase" style={themeText}>
        Sessão e perfis
      </h2>
      <p className="mt-2 text-body font-medium text-zinc-600">
        Os jogadores escolhem o próprio nome na tela de entrada. A senha de cada perfil é opcional.
      </p>

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`mt-4 rounded-control border-2 px-3 py-2 text-caption font-bold ${
            message.kind === 'error'
              ? 'border-rose-500 bg-rose-50 text-rose-700'
              : 'border-emerald-500 bg-emerald-50 text-emerald-700'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => setSessionNameAction(sessionDraft), 'Nome da sessão salvo.');
          }}
        >
          <label htmlFor="session-name" className={labelClass} style={themeText}>Nome da sessão</label>
          <div className="flex gap-2">
            <input id="session-name" value={sessionDraft} onChange={(e) => setSessionDraft(e.target.value)} className={`${inputClass} min-w-0 flex-1`} maxLength={60} />
            <button type="submit" disabled={pending} className={primaryButtonClass} style={themeBg}>Salvar</button>
          </div>
        </form>

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => setMasterPasswordAction(masterPassword), masterPassword ? 'Senha do Mestre definida.' : 'Senha do Mestre removida.', () => setMasterPassword(''));
          }}
        >
          <label htmlFor="master-password" className={labelClass} style={themeText}>
            Senha do Mestre {hasMasterPassword ? '(definida)' : '(opcional)'}
          </label>
          <div className="flex gap-2">
            <input id="master-password" type="password" autoComplete="new-password" value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} placeholder={hasMasterPassword ? 'Nova senha (vazio remove)' : 'Para entrar de outro aparelho'} className={`${inputClass} min-w-0 flex-1`} />
            <button type="submit" disabled={pending || (!masterPassword && !hasMasterPassword)} className={primaryButtonClass} style={themeBg}>
              {masterPassword || !hasMasterPassword ? 'Definir' : 'Remover'}
            </button>
          </div>
          <p className="text-caption font-bold text-zinc-500">
            No computador do Mestre a entrada é automática. Esqueceu a senha? Crie o arquivo RESET_SENHA_MESTRE na pasta do app e reinicie.
          </p>
        </form>
      </div>

      <h3 className="mt-6 border-b border-zinc-200 pb-2 text-lead font-extrabold">Perfis de jogador ({profiles.length})</h3>

      <ul className="mt-4 flex flex-col gap-2">
        {profiles.length === 0 && (
          <li className="text-body font-medium text-zinc-500">Nenhum perfil criado ainda.</li>
        )}
        {profiles.map((profile) => (
          <li key={profile.id} className="flex flex-col gap-2 rounded-inset border-2 border-black bg-zinc-50 p-3 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              {editing?.id === profile.id ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => renameProfileAction(profile.id, editing.name), 'Perfil renomeado.', () => setEditing(null));
                  }}
                >
                  <input aria-label="Novo nome do perfil" value={editing.name} onChange={(e) => setEditing({ id: profile.id, name: e.target.value })} className={`${inputClass} w-40`} maxLength={40} autoFocus />
                  <button type="submit" disabled={pending} className={buttonClass}>Salvar</button>
                  <button type="button" onClick={() => setEditing(null)} className={buttonClass}>Cancelar</button>
                </form>
              ) : (
                <>
                  <span className="truncate text-lead font-extrabold italic">{profile.name}</span>
                  <span className="rounded-full border-2 border-zinc-200 px-2 text-label font-extrabold uppercase text-zinc-600">
                    {profile.hasPassword ? 'Com senha' : 'Sem senha'}
                  </span>
                  <span className="text-caption font-bold text-zinc-500">
                    {profile.characterCount} {profile.characterCount === 1 ? 'ficha' : 'fichas'}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {passwordFor?.id === profile.id ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => setProfilePasswordAction(profile.id, passwordFor.value), passwordFor.value ? 'Senha do perfil definida.' : 'Senha do perfil removida.', () => setPasswordFor(null));
                  }}
                >
                  <input aria-label="Senha do perfil" type="password" autoComplete="new-password" value={passwordFor.value} onChange={(e) => setPasswordFor({ id: profile.id, value: e.target.value })} placeholder="Vazio remove" className={`${inputClass} w-40`} autoFocus />
                  <button type="submit" disabled={pending} className={buttonClass}>Salvar</button>
                  <button type="button" onClick={() => setPasswordFor(null)} className={buttonClass}>Cancelar</button>
                </form>
              ) : (
                <>
                  <button type="button" onClick={() => setEditing({ id: profile.id, name: profile.name })} className={buttonClass}>Renomear</button>
                  <button type="button" onClick={() => setPasswordFor({ id: profile.id, value: '' })} className={buttonClass}>Senha</button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const aviso = profile.characterCount > 0
                        ? `Remover "${profile.name}" também apaga ${profile.characterCount} ficha(s) dele, com Pokémon, itens e notas. Isso não pode ser desfeito. Continuar?`
                        : `Remover o perfil "${profile.name}"?`;
                      if (window.confirm(aviso)) run(() => removeProfileAction(profile.id), 'Perfil removido.');
                    }}
                    className="h-8 rounded-sm border-2 border-black bg-rose-100 px-3 text-label font-extrabold uppercase text-rose-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Remover
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => createProfileAction(newName, newPassword || undefined), 'Perfil criado.', () => {
            setNewName('');
            setNewPassword('');
          });
        }}
      >
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="new-profile" className={labelClass} style={themeText}>Novo perfil</label>
          <input id="new-profile" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do jogador" className={inputClass} maxLength={40} />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <label htmlFor="new-profile-password" className={labelClass} style={themeText}>Senha (opcional)</label>
          <input id="new-profile-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" disabled={pending || !newName.trim()} className={primaryButtonClass} style={themeBg}>Criar perfil</button>
      </form>
    </section>
  );
}
