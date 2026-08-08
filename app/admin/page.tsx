import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { deleteCharacterAction } from './actions';

// Server Component para o Painel do Mestre (GM)
export default async function AdminPage() {
  // 1. Validar Sessão e Autorização do Mestre (GM) no servidor
  const session = await auth();

  if (!session || !session.user || (session.user as any).role !== 'GM') {
    redirect('/');
  }

  // 2. Query relacional para obter todos os usuários e suas fichas/relações
  const users = await prisma.user.findMany({
    include: {
      characters: {
        include: {
          pokemons: true,
          items: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-12">
      {/* Cabeçalho Holográfico */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full border-2 border-rose-500 flex items-center justify-center bg-rose-950/30 animate-pulse">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>
            <h1 className="text-xl font-bold tracking-wider text-rose-400">
              TRAINER CARD <span className="text-white">PRO</span>
            </h1>
            <span className="bg-rose-500/10 text-rose-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-rose-500/20">
              PAINEL DO MESTRE (GM)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400 text-sm">
              Conectado como <strong className="text-white">{session.user.name || session.user.email}</strong>
            </span>
            <a
              href="/"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Voltar ao App
            </a>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Controle Geral de Fichas</h2>
          <p className="mt-2 text-sm text-slate-400">
            Monitore jogadores ativos, consulte fichas registradas e audite estatísticas em tempo real.
          </p>
        </div>

        {/* Lista de Jogadores (Grid Glassmorphism) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-900/60"
            >
              {/* Header do Card do Usuário */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Avatar'}
                      className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-400 font-semibold">
                      {(user.name || 'U').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {user.name || 'Treinador Sem Nome'}
                    </h3>
                    <p className="text-xs text-slate-500">{user.email || 'Sem email associado'}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                    user.role === 'GM'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Seção de Fichas */}
              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Fichas Associadas ({user.characters.length})
                </h4>

                {user.characters.length === 0 ? (
                  <p className="text-sm text-slate-500 italic py-2">Nenhum personagem criado por este jogador.</p>
                ) : (
                  <div className="space-y-3">
                    {user.characters.map((char) => (
                      <div
                        key={char.id}
                        className="flex items-center justify-between rounded-xl bg-slate-950/60 p-4 border border-slate-900 hover:border-slate-800 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {char.avatarUrl ? (
                            <img
                              src={char.avatarUrl}
                              alt={char.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-800 bg-slate-900"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg border border-dashed border-slate-800 bg-slate-900 flex items-center justify-center text-slate-600 text-xs">
                              Poké
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-slate-200">{char.name}</span>
                              <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                LV {char.level}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              💰 P$ {char.money.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Ações e Badges Rápidas */}
                        <div className="flex items-center space-x-3">
                          <span className="bg-sky-500/10 text-sky-400 text-xs px-2 py-0.5 rounded-lg border border-sky-500/20 flex items-center space-x-1">
                            <span>🐾</span>
                            <strong>{char.pokemons.length}</strong>
                          </span>
                          <span className="bg-amber-500/10 text-amber-400 text-xs px-2 py-0.5 rounded-lg border border-amber-500/20 flex items-center space-x-1">
                            <span>🎒</span>
                            <strong>{char.items.reduce((acc, i) => acc + i.quantity, 0)}</strong>
                          </span>
                          
                          {/* Excluir Ficha (Ação Crítica Protegida por Server Action) */}
                          <form action={async () => {
                            'use server';
                            await deleteCharacterAction(char.id);
                          }}>
                            <button
                              type="submit"
                              className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                              title="Excluir Ficha Permanentemente"
                            >
                              <i className="fa-solid fa-trash text-[11px]" />
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
