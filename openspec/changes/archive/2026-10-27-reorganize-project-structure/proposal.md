# Proposal

## Why

A raiz do projeto mistura configuração, código-fonte e arquivos soltos: `App.tsx`, `auth.ts`, `constants.ts`, `types.ts` e `index.css` ao lado de `next.config.ts` e `package.json`, além de `metadata.json` (sobra de template), `Trainer Card Pro.session.sql` (vazio) e a pasta `conteudo/` com o livro de regras. O código está espalhado em `app/`, `components/`, `lib/` e `src/data/`, ou seja, o diretório `src/` existe mas só guarda um arquivo.

Os imports acompanham a bagunça: há 40 imports relativos que sobem níveis (`../../../lib/prisma`, `../types`, `../src/data/capabilities`), que quebram a cada arquivo movido. As fases 2 a 5 do programa de refatoração vão criar, mover e dividir muitos arquivos (login, camada de serviços, `App.tsx` em abas). Organizar antes delas evita refazer caminhos no meio de cada uma.

## What Changes

- Mover o código-fonte para `src/`, adotando o layout `src/` do Next.js: `src/app`, `src/components`, `src/lib`, `src/data`, `src/App.tsx`, `src/auth.ts`, `src/constants.ts`, `src/types.ts` e `src/index.css`.
- O alias `@/` passa a apontar para `src/*` (no `tsconfig.json` e no Vitest), e todo import que sobe diretório (`../`) vira `@/...`. Uma regra de ESLint passa a proibir `../` para que a convenção não se perca.
- Limpar a raiz, que fica só com configuração (`package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `prisma.config.ts`, `vitest.config.ts`, `.eslintrc.json`, `.prettierrc`), as pastas `src/`, `prisma/`, `public/`, `scripts/`, `__tests__/`, `openspec/`, e os documentos `README.md`, `CLAUDE.md`, `DESIGN.md`, `LICENSE`:
  - remover `metadata.json` e `Trainer Card Pro.session.sql`;
  - mover `conteudo/` para `openspec/regras/fonte/`, onde o catálogo de regras já o referencia;
  - ignorar no git `tsconfig.tsbuildinfo` e `dev.db-shm` / `dev.db-wal`.
- Atualizar as configurações que apontam para caminhos: `tailwind.config.ts` (content), `vitest.config.ts` (alias), `tsconfig.json` (paths), `.eslintrc.json`, e as referências em `CLAUDE.md`, `DESIGN.md`, `README.md` e na skill `pokedex-ui`.
- Fora de escopo: nenhuma mudança de comportamento, visual, esquema de banco ou lógica. O `dev.db` fica na raiz, porque o `DATABASE_URL` do `.env` de cada máquina aponta para ele. Também não divide o `App.tsx` (fase 5) nem renomeia componentes.

## Capabilities

### New Capabilities

- `project-structure`: onde cada tipo de arquivo mora no repositório (código em `src/`, configuração na raiz), como os módulos se importam entre si (alias `@/`) e a garantia de que reorganizar não altera o comportamento do app.

### Modified Capabilities

(nenhuma; a spec `observability` não muda)

## Impact

- **Arquivos movidos:** `app/**`, `components/**`, `lib/**`, `src/data/**`, `App.tsx`, `auth.ts`, `constants.ts`, `types.ts`, `index.css` (cerca de 45 arquivos), mais `conteudo/**`.
- **Configuração:** `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `.eslintrc.json`, `.gitignore`.
- **Testes:** `__tests__/**` continuam na raiz, mas os mocks e imports com caminho relativo (`../../App`, `../../app/page`) passam a usar `@/`.
- **Documentação de trabalho:** `CLAUDE.md`, `DESIGN.md`, `README.md`, a skill `.claude/skills/pokedex-ui` e `openspec/regras/catalogo-pta2.md`.
- **Dependências, API, banco e `.env`:** nenhuma mudança. O histórico do git preserva os arquivos movidos se usado `git mv`.
