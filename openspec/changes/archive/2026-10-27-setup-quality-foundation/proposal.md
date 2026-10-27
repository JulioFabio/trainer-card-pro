# Proposal

## Why

O projeto não tem rede de segurança para a refatoração que vem a seguir. Os testes em `__tests__/` não rodam porque nenhum runner está instalado. O TypeScript está com `strict: false` e não há configuração de ESLint. Por isso passaram despercebidos dois bugs encontrados em 22/10/2026: uma chave faltando no `App.tsx` e o adaptador do Prisma 7 recebendo o tipo errado.

Os logs também atrapalham. Cada query do Prisma é logada com os parâmetros, que incluem a ficha inteira, e o cache loga cada HIT/MISS. Isso gasta CPU e I/O em toda requisição e expõe dados da ficha. Ao mesmo tempo, o `/api/health` engole a causa real das falhas de banco. Esta é a fase 1 de 5 do programa de refatoração. As fases seguintes dependem de poder testar e tipar o código com confiança.

## What Changes

- Instalar e configurar um runner de testes. Os testes existentes em `__tests__/` passam a rodar com `npm test`, e os quebrados são corrigidos ou marcados para remoção.
- Adicionar o script `npm run typecheck` e ativar o `strict` do TypeScript de forma incremental, corrigindo os erros que aparecerem.
- Adicionar a configuração do ESLint (`next/core-web-vitals` + TypeScript) e deixar `npm run lint` sem erros.
- Adicionar o script `npm run check`, que roda typecheck, lint e testes. Ele vira a porta de entrada de cada change futura.
- Enxugar os logs:
  - nível de log configurável por variável de ambiente;
  - queries do Prisma sem parâmetros e só acima de um limiar de lentidão;
  - logs de cache em nível `debug`;
  - nenhum conteúdo de ficha nos logs.
- `/api/health` passa a registrar no log a causa da falha do banco, sem expor detalhes na resposta.
- Adicionar teste de regressão para a criação do cliente Prisma (o bug do adaptador).

Fora de escopo: mudanças de login (fase 2), autorização e validação das rotas (fase 3), modelo de dados (fase 4) e divisão do `App.tsx` (fase 5).

## Capabilities

### New Capabilities

- `observability`: o que o servidor registra em log, em que nível, o que nunca pode aparecer nos logs, e como o health check reporta falhas.

### Modified Capabilities

(nenhuma; ainda não existem specs no projeto)

## Impact

- **Dependências de desenvolvimento:** runner de testes e utilitários de teste do React, além de plugins do ESLint.
- **Arquivos:** `package.json` (scripts), `tsconfig.json`, nova config do ESLint, config do runner, `lib/telemetry.ts`, `lib/cache.ts`, `lib/prisma.ts`, `app/api/health/route.ts`, `__tests__/**`.
- **Código de produção:** os erros revelados pelo `strict` serão corrigidos em vários arquivos, sem mudar comportamento.
- **Operação:** nova variável de ambiente `LOG_LEVEL` (padrão `info`), documentada no `.env.example`.
