# Trainer Card Pro

Ficha digital de personagem para o RPG Pokémon (PTA 2.0 / PTU). Uso: uma mesa pequena de jogadores + 1 GM. Idioma de código, commits e artefatos: pt-BR.

## Stack (fixa, não trocar)

Next.js 15 (App Router), React 19, TypeScript `strict`, TailwindCSS 3, Prisma 7 + SQLite (`better-sqlite3`), NextAuth v5. `package.json` tem `"type": "module"`.

## Comandos

- `npm run check`: typecheck + lint + testes. É o critério de pronto de toda change.
- `npm test` / `npm run test:watch`: Vitest. `npm run typecheck`, `npm run lint`.
- `npm run dev`: servidor em `localhost:3000`. Health check em `GET /api/health`.

## Fontes da verdade

- **Comportamento e requisitos:** `openspec/specs/` e a change ativa em `openspec/changes/`. Fluxo: `/opsx:propose` → `/opsx:apply` → `/opsx:archive`. Os programas de refatoração estão listados em `openspec/config.yaml`.
- **Visual:** `DESIGN.md` na raiz. Ao mexer em UI (`.tsx`, `className`, `index.css`, `tailwind.config.ts`), use a skill `pokedex-ui`. A estética não muda; só as proporções seguem as escalas do documento.
- Não há documentação viva em `docs/`. O código, o `schema.prisma` e as specs são a referência. Não recrie descrições por componente.

## Estrutura

- `app/`: rotas e páginas (`app/api/*` para a API, `app/admin` para o painel do GM).
- `components/`: componentes React. `App.tsx` na raiz é o shell principal (será quebrado numa change futura).
- `lib/`: `prisma.ts` (cliente), `telemetry.ts` (logger e `withTelemetry`), `queryLog.ts`, `cache.ts`, `safeFetch.ts`, `routeHelpers.ts`.
- `prisma/schema.prisma`: modelo de dados. `auth.ts`: configuração do NextAuth.
- `__tests__/unit` e `__tests__/integration`: testes Vitest. Arquivos `.test.ts` rodam em `node`, `.test.tsx` em `jsdom`.

## Convenções

- Testes com imports explícitos de `vitest` (sem globals). Mocks com `vi.mock`; variáveis usadas dentro do mock vêm de `vi.hoisted`.
- Logs só pelo `logger` de `lib/telemetry.ts`, nunca `console` direto. Nível por `LOG_LEVEL` (padrão `info`), queries lentas por `SLOW_QUERY_MS` (padrão 100).
- Nunca logar dados de ficha, notas, corpos de requisição ou `params` de queries.
- `any` gera aviso de lint; não introduza novos em código novo.
- Cada change deve deixar o app funcionando e `npm run check` verde.
