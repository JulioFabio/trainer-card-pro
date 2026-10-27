# Design

## Context

Estado medido em 27/10/2026, na raiz do repositório:

- **Código na raiz:** `App.tsx`, `auth.ts`, `constants.ts`, `types.ts`, `index.css`, mais as pastas `app/`, `components/` e `lib/`. `src/` existe, mas só tem `data/capabilities.ts`.
- **Aliases:** `@/` aponta para a raiz (`tsconfig.json` → `"@/*": ["./*"]`). São 26 imports com `@/` (`@/lib` ×13, `@/auth` ×8, `@/app` ×4, `@/components` ×1) e cerca de 40 imports relativos com `../`, como `../../../lib/prisma` nas rotas de API e `../src/data/capabilities` num componente.
- **Next.js:** suporta `src/app`. Se `app/` existir na raiz **e** em `src/`, a raiz vence, então a mudança tem de ser total, não parcial. Não há `middleware.ts`.
- **Caminhos que dependem da raiz:** `tailwind.config.ts` (`content` lista `./app`, `./components`, `./src`, `./*.{ts,tsx}`), `vitest.config.ts` (alias `@` → raiz), `app/api/upload/route.ts` (`process.cwd()/public/uploads`, que não muda), `prisma.config.ts` e `lib/prisma.ts` (`file:./dev.db`, relativo ao diretório de execução, que não muda).
- **Arquivos soltos sem uso:** `metadata.json` (template do AI Studio, sem referência no código), `Trainer Card Pro.session.sql` (vazio, vem do SQLTools), `tsconfig.tsbuildinfo` e `dev.db-shm` / `dev.db-wal` (gerados em execução).
- **`conteudo/`:** contém o livro de regras em texto (1,2 MB), citado por `openspec/regras/catalogo-pta2.md`, e `reset_and_placeholders_implementation.md`, uma documentação técnica antiga.

## Goals / Non-Goals

**Goals:**
- Raiz com apenas configuração, documentação do projeto e pastas de topo bem definidas.
- Um único jeito de importar entre módulos (`@/`), garantido por lint.
- Mover arquivos preservando o histórico do git.

**Non-Goals:**
- Reorganizar o interior de `components/` ou `lib/` em subpastas (por feature, por exemplo). Isso é decidido na fase 5, quando o `App.tsx` for dividido.
- Mover o `dev.db` ou mexer no `.env`.
- Renomear arquivos ou símbolos.

## Decisions

### D1. Layout `src/` do Next.js
`app`, `components`, `lib`, `data`, `App.tsx`, `auth.ts`, `constants.ts`, `types.ts` e `index.css` vão para `src/`. `public/`, `prisma/`, `scripts/`, `__tests__/` e `openspec/` ficam na raiz: o Next e o Prisma esperam `public/` e `prisma/` ali, e testes e specs não são código da aplicação.
- *Alternativa:* só arrumar a raiz e deixar `app/`, `components/` e `lib/` onde estão. Resolve menos: `src/` continuaria quase vazio e a raiz continuaria misturando código e configuração.
- *Alternativa:* pastas por feature (`src/features/pc`, `src/features/team`...). Fica para a fase 5.

### D2. Alias `@/` aponta para `src/*`
Muda `"@/*": ["./src/*"]` no `tsconfig.json` e o alias do Vitest. Como todos os 26 imports `@/lib`, `@/auth`, `@/app` e `@/components` existentes apontam para código que se move junto, eles continuam válidos sem edição. O `next.config.ts` não precisa de alias, pois o Next lê os `paths` do `tsconfig.json`.

### D3. Proibir `../` com ESLint
Adicionar `no-restricted-imports` com o padrão `../*` em `.eslintrc.json` (nível `error`). Isso transforma a convenção em verificação do `npm run check`. Imports `./` do vizinho continuam permitidos (por exemplo, `./telemetry` em `lib/`). Os imports `../` existentes são convertidos para `@/` na migração.

### D4. `git mv` e commits separados
Mover com `git mv` para o git registrar renomeação. A sequência de commits da implementação é: (1) mover arquivos, (2) ajustar configs e imports, (3) regra de lint e documentação. Um commit só de movimentação, sem edição de conteúdo, mantém o `git log --follow` legível.

### D5. Limpeza da raiz
- `metadata.json` e `Trainer Card Pro.session.sql`: removidos (sem uso, recuperáveis pelo git).
- `conteudo/pokemon-livro-do-jogador-biblioteca-elfica.txt` → `openspec/regras/fonte/`, onde o catálogo que o cita já mora; a referência no catálogo é atualizada.
- `conteudo/reset_and_placeholders_implementation.md`: removido. É documentação técnica antiga no estilo da documentação viva já descartada, e o comportamento descrito está no código.
- `tsconfig.tsbuildinfo`, `dev.db-shm` e `dev.db-wal`: entram no `.gitignore` (`*.tsbuildinfo` e `dev.db*`, que substitui as linhas `dev.db` e `dev.db-journal`).
- `scripts/` fica na raiz: é a convenção do ecossistema e os três scripts não dependem de `src/`.

### D6. `dev.db` não se move
O `DATABASE_URL` do `.env` de cada máquina e a conexão do SQLTools em `.vscode/settings.json` apontam para `./dev.db`. Mover quebraria ambientes já configurados sem ganho funcional.

### D7. Tailwind lê só `src/`
O `content` do `tailwind.config.ts` passa a `./src/**/*.{js,ts,jsx,tsx}`. É o risco mais silencioso desta change: esquecer o glob faz o CSS sair sem classes e o app aparecer sem estilo, sem nenhum erro de build.

## Risks / Trade-offs

- [Tailwind deixa de gerar classes e o app fica sem estilo, sem erro] → Verificar na tarefa final com `npm run build` e abrir a página; comparar o tamanho do CSS gerado em `.next/static/css` com o da linha de base.
- [Cache do Next/TS aponta para caminhos antigos] → Apagar `.next/` e `tsconfig.tsbuildinfo` antes de verificar.
- [Mocks de teste com caminho relativo (`../../App`) quebram] → `vi.mock` precisa do mesmo caminho do import; migrar para `@/App` e `@/app/page` junto com o resto.
- [Outros trabalhos em andamento conflitam com a movimentação] → Fazer com a árvore limpa e antes das fases 2 a 5.
- [Docs e skills ficam com caminhos velhos e induzem a erro] → Tarefa dedicada, com `grep` dos caminhos antigos como critério de pronto.
- [Perda de `git blame`] → `git mv` sem edição no mesmo commit; o Git detecta renomeação por similaridade.

## Migration Plan

1. Garantir a árvore limpa e anotar a linha de base: `npm run check` e `npm run build` verdes e o número de testes.
2. Executar as movimentações com `git mv`, depois ajustar configs e imports e rodar `npm run check`.
3. Rodar `npm run build`, iniciar o `npm run dev`, abrir `/` e conferir o visual e `/api/health`.

Rollback: reverter os commits da change. Não há migração de dados.

## Open Questions

- Remover `conteudo/reset_and_placeholders_implementation.md` (D5) pressupõe que ninguém precisa dele. Se houver algo útil nele, vira uma spec em vez de ser descartado.
