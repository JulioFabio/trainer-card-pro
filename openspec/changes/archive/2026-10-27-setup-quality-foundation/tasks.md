# Tasks

## 1. Runner de testes (Vitest)

- [x] 1.1 Instalar `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` e `@types/better-sqlite3` como devDependencies, e remover `@types/jest`. Verificar com `npm ls vitest @testing-library/react` sem erros.
- [x] 1.2 Criar `vitest.config.ts` com alias `@/`, ambiente `jsdom` para `*.test.tsx` e `node` para `*.test.ts` (design D1), e adicionar os scripts `test` (`vitest run`) e `test:watch` no `package.json`. Verificar que `npm test` encontra os 6 arquivos de `__tests__/`.
- [x] 1.3 Migrar os mocks dos 6 arquivos de teste de `jest.*` para `vi.*` com imports explícitos de `vitest`, usando `vi.hoisted` onde o mock usa variáveis externas. Verificar que `npm test` passa. Anotar na própria tarefa qualquer teste que falhe por bug real do código, em vez de apagá-lo.

## 2. TypeScript strict e ESLint

- [x] 2.1 Ativar `"strict": true` no `tsconfig.json` e adicionar o script `typecheck` (`tsc --noEmit`). Verificar que `npm run typecheck` termina sem erros.
- [x] 2.2 Criar `.eslintrc.json` estendendo `next/core-web-vitals` e `next/typescript`, com `@typescript-eslint/no-explicit-any` em `warn` (design D3). Verificar que `npm run lint` roda sem prompt interativo e termina com 0 erros (avisos permitidos).
- [x] 2.3 Corrigir os erros de lint que aparecerem sem alterar comportamento. Verificar com `npm run lint` (0 erros) e `npm test` (verde).
- [x] 2.4 Adicionar o script `check` (`npm run typecheck && npm run lint && npm test`). Verificar que `npm run check` passa.

## 3. Logs enxutos (spec `observability`)

- [x] 3.1 Adicionar ao `lib/telemetry.ts` o nível `debug` e o filtro por `LOG_LEVEL` (padrão `info`), aplicado antes da serialização (design D4). Cobrir com testes os cenários "Nível padrão", "Nível restrito" e "Registro dentro de uma requisição", e verificar que passam.
- [x] 3.2 Trocar os logs de `lib/cache.ts` para `logger.debug` (D6). Verificar com o teste do cenário "Leitura do cache com nível padrão".
- [x] 3.3 Em `lib/prisma.ts`, logar só queries acima de `SLOW_QUERY_MS` (padrão 100) com `logger.warn`, sem `params`, e remover o log `info` do stdout do Prisma (D5). Cobrir os cenários "Query rápida" e "Query lenta" com o handler extraído numa função testável, e verificar que passam.
- [x] 3.4 Adicionar um teste de regressão que cria o cliente Prisma contra um SQLite temporário e executa `SELECT 1`, protegendo contra o bug do adaptador de 22/10/2026. Verificar que passa.
- [x] 3.5 No `app/api/health/route.ts`, registrar `logger.error` com a causa quando o banco falhar, mantendo a resposta `503` sem detalhes. Cobrir os cenários "Banco disponível" e "Banco indisponível", e verificar que passam.
- [x] 3.6 Adicionar o teste do requisito "Dados de ficha nunca aparecem nos logs": `PUT /api/character` com um sentinela no `sheetData` e `LOG_LEVEL=debug`, sem nenhuma saída de console contendo o sentinela (D7). Verificar que passa.
- [x] 3.7 Documentar `LOG_LEVEL` e `SLOW_QUERY_MS` no `.env.example`. Verificar que os nomes das variáveis batem com o código. (A atualização de `docs/[DevOps] Telemetria e Observabilidade.md` foi dispensada: a documentação viva em `docs/` foi removida do projeto; as regras de log ficam no `CLAUDE.md` e na spec `observability`.)

## 4. Verificação integrada

- [x] 4.1 Rodar `npm run check` (verde) e `npm run dev`, confirmar `GET /api/health` = 200 e a página inicial = 200, e confirmar que, com `LOG_LEVEL` padrão, carregar a ficha não gera logs de query nem de cache no terminal.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, propor a fase 2: `rebuild-authentication`.
