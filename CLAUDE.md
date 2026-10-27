# Trainer Card Pro

Ficha digital de personagem para o RPG Pokémon (PTA 2.0 / PTU). Uso: uma mesa pequena de jogadores + 1 GM. Idioma de código, commits e artefatos: pt-BR.

## Stack (fixa, não trocar)

Next.js 15 (App Router), React 19, TypeScript `strict`, TailwindCSS 3, Prisma 7 + SQLite (`better-sqlite3`), NextAuth v5. `package.json` tem `"type": "module"`.

## Comandos

- `npm run check`: typecheck + lint + testes. É o critério de pronto de toda change.
- `npm test` / `npm run test:watch`: Vitest. `npm run typecheck`, `npm run lint`.
- `npm run dev`: servidor em `localhost:3000`. Health check em `GET /api/health`.
- `npm run shots [rótulo]`: prints das telas (Mestre, jogador, abas, trocas, admin, celular) em `screenshots/<data-hora>[-rótulo]/` e `screenshots/latest/`. Usa um banco temporário em `.shots/`, então não mexe no `dev.db` nem atrapalha o `npm run dev`. A pasta é ignorada pelo git.

## Fontes da verdade

- **Comportamento e requisitos:** `openspec/specs/` e a change ativa em `openspec/changes/`. Fluxo: `/opsx:propose` → `/opsx:apply` → `/opsx:archive`. Os programas de refatoração estão listados em `openspec/config.yaml`.
- **Visual:** `DESIGN.md` na raiz. Ao mexer em UI (`.tsx`, `className`, `src/index.css`, `tailwind.config.ts`), use a skill `pokedex-ui`. A estética não muda; só as proporções seguem as escalas do documento.
- Não há documentação viva em `docs/`. O código, o `schema.prisma` e as specs são a referência. Não recrie descrições por componente.

## Estrutura

- `src/`: todo o código da aplicação. Imports entre módulos usam o alias `@/` (= `src/`); `../` é proibido pelo lint.
- `src/app/`: rotas e páginas (`src/app/api/*` para a API, `src/app/admin` para o painel do GM).
- `src/components/`: componentes React. `src/App.tsx` é o shell principal (será quebrado numa change futura).
- `src/lib/`: `prisma.ts` (cliente), `telemetry.ts` (logger e `withTelemetry`), `queryLog.ts`, `cache.ts`, `safeFetch.ts`, `routeHelpers.ts`.
- `prisma/schema.prisma`: modelo de dados. `src/auth.ts`: configuração do NextAuth. `src/constants.ts` e `src/types.ts`: constantes e tipos globais.
- `__tests__/unit` e `__tests__/integration`: testes Vitest. Arquivos `.test.ts` rodam em `node`, `.test.tsx` em `jsdom`.

## Convenções

- Testes com imports explícitos de `vitest` (sem globals). Mocks com `vi.mock`; variáveis usadas dentro do mock vêm de `vi.hoisted`.
- Logs só pelo `logger` de `src/lib/telemetry.ts`, nunca `console` direto. Nível por `LOG_LEVEL` (padrão `info`), queries lentas por `SLOW_QUERY_MS` (padrão 100).
- Nunca logar dados de ficha, notas, corpos de requisição ou `params` de queries.
- `any` gera aviso de lint; não introduza novos em código novo.
- Cada change deve deixar o app funcionando e `npm run check` verde.
- Depois de qualquer mudança que afete a interface, rode `npm run shots <rótulo>` e olhe os prints antes de dizer que terminou; avise o mestre onde estão.
