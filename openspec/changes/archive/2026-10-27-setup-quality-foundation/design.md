# Design

## Context

Motivação em `proposal.md`, seção Why. Estado atual medido em 22/10/2026:

- **Testes:** 6 arquivos em `__tests__/`, divididos entre `unit/` e `integration/`, escritos com a API do Jest (`jest.mock`, `jest.fn`). O `@types/jest` está instalado, mas não há runner, `@testing-library/react` nem script `test`. Os testes de integração mockam `@/auth`, `@/lib/prisma`, `@/lib/telemetry` e `@/lib/cache`, então na prática também são unitários.
- **TypeScript:** `strict: false`. Rodar `tsc --strict` hoje mostra só 2 erros: faltam `@types/better-sqlite3` e `@testing-library/react`. O código, porém, tem 31 usos de `any`/`as any` (rotas, `auth.ts`, componentes), que escondem erros que o `strict` pegaria.
- **ESLint:** o ESLint 8 e o `eslint-config-next` estão instalados, mas não há arquivo de configuração. Por isso `next lint` abre um assistente interativo.
- **Logs:** `lib/telemetry.ts` não tem níveis configuráveis. `lib/prisma.ts` loga toda query com `params`. `lib/cache.ts` loga todo acesso em `info`. O `/api/health` descarta o erro no `catch`.
- O `package.json` tem `"type": "module"`.

## Goals / Non-Goals

**Goals:**
- `npm run check` roda typecheck, lint e testes em menos de 1 minuto e passa.
- Os requisitos de `specs/observability/spec.md` são cobertos por testes.
- Nenhuma mudança visível para o jogador.

**Non-Goals:**
- Eliminar todos os `any`. Os que estão em rotas e no `App.tsx` somem nas fases 3 e 5, quando esses arquivos forem reescritos. Aqui o lint só os aponta como aviso.
- Testes end-to-end com navegador.
- CI no GitHub Actions. O repositório tem remote no GitHub, mas não tem workflow. Rodar o `npm run check` no CI pode virar uma change própria depois, e por enquanto ele é local.

## Decisions

### D1. Vitest como runner, em vez de Jest
O Vitest roda TypeScript e ESM nativamente via esbuild. O projeto é `"type": "module"`, e o Jest exigiria transform SWC/Babel, config `.cjs` e ajustes de ESM. A API do Vitest (`vi.mock`, `vi.fn`) é quase idêntica à do Jest: a migração dos 6 arquivos é troca de `jest.` por `vi.` mais o import explícito.
- *Alternativa:* `next/jest`. Mantém a sintaxe atual, mas é mais lento, adiciona mais dependências e tem atrito com ESM.
- *Configuração:* `vitest.config.ts` com `environment: 'jsdom'` para arquivos `.tsx` e `node` para os demais (via `environmentMatchGlobs` ou comentário por arquivo). Alias `@/` igual ao `tsconfig`. `globals: false` (imports explícitos).
- O `@types/jest` sai das dependências.

### D2. `strict: true` de uma vez
Com só 2 erros a corrigir, não vale ativar as flags uma a uma. Adicionar `@types/better-sqlite3` e corrigir os testes resolve os dois.

### D3. ESLint com config legada `.eslintrc.json`
O ESLint instalado é o 8, e `next lint` no Next 15 ainda aceita `.eslintrc`. A config estende `next/core-web-vitals` e `next/typescript`. A regra `@typescript-eslint/no-explicit-any` fica como `warn`, porque as fases 3 e 5 reescrevem os arquivos com `any`. O lint passa sem erros, só com avisos. A migração para flat config fica para quando o ESLint for atualizado, fora deste programa.

### D4. Logger com níveis e sem dependência nova
O `lib/telemetry.ts` ganha `debug` e um filtro por `LOG_LEVEL`, lido uma vez no carregamento do módulo. Continua usando `console` com JSON. Para uma mesa pequena, uma biblioteca como `pino` não compensa a dependência extra.
- `logger.error` mantém a assinatura `(message, error, context)`.
- O filtro é uma comparação de inteiros antes de montar o JSON, então um log desligado não custa a serialização.

### D5. Prisma: só queries lentas, sem parâmetros
Em `lib/prisma.ts`, o handler `$on('query')` passa a emitir `logger.warn` apenas quando `e.duration > SLOW_QUERY_MS` (constante 100, sobrescrevível por `SLOW_QUERY_MS` no env). Ele inclui `e.query` e `durationMs`, nunca `e.params`. Os logs `info` do Prisma no stdout são removidos. `warn` e `error` continuam.

### D6. Cache em `debug`
`lib/cache.ts` troca `logger.info` por `logger.debug`. O comportamento do cache não muda.

### D7. Testes de logs por espionagem do console
Os testes dos requisitos de observabilidade espionam `console.log/warn/error` e fazem parse das linhas JSON. Para a regra "dados de ficha nunca aparecem", o teste chama o `PUT /api/character` com um valor-sentinela (ex.: `"SENTINELA-XYZ"`) no `sheetData` e verifica que nenhuma saída contém esse texto.

## Risks / Trade-offs

- [Mocks escritos para Jest podem depender de hoisting específico] → O `vi.mock` também é içado. Os mocks que usam variáveis externas precisam do prefixo `vi.hoisted`. Corrigir caso a caso ao migrar.
- [`loginScreen.test.tsx` testa a tela de login que será descartada na fase 2] → Migrar mesmo assim para manter a rede de segurança até lá. A fase 2 remove o arquivo junto com a tela.
- [Esconder queries `info` pode dificultar o debug local] → Com `LOG_LEVEL=debug`, as queries são logadas em `debug`, sem parâmetros.
- [`strict` em código novo das próximas fases pode gerar atrito] → É o objetivo: o `npm run check` vira o critério de pronto de cada change.

## Migration Plan

Mudanças só de ferramentas e logs, sem migração de dados. O rollback é reverter os commits. O `.env.example` ganha `LOG_LEVEL` e `SLOW_QUERY_MS`, ambos opcionais.
