# Tasks

## 1. Linha de base

- [x] 1.1 Com a árvore do git limpa, rodar `npm run check` e `npm run build`, anotando o número de testes (hoje 44) e se o build passa. Se o build já falhar antes da change, registrar o erro na própria tarefa em vez de corrigi-lo aqui. Verificar com `git status --short` sem alterações pendentes.

## 2. Movimentação (commit só de renomeações)

- [x] 2.1 Com `git mv`, mover `app/`, `components/`, `lib/`, `App.tsx`, `auth.ts`, `constants.ts`, `types.ts` e `index.css` para dentro de `src/` (a pasta `src/data/` já está no lugar). Verificar que a raiz não tem mais esses itens e que `git status` mostra só renomeações (`R`).
- [x] 2.2 Mover `conteudo/pokemon-livro-do-jogador-biblioteca-elfica.txt` para `openspec/regras/fonte/` e remover `conteudo/reset_and_placeholders_implementation.md` (design D5). Verificar que `conteudo/` não existe mais.
- [x] 2.3 Remover `metadata.json` e `Trainer Card Pro.session.sql`. Substituir no `.gitignore` as linhas `dev.db` e `dev.db-journal` por `dev.db*` e acrescentar `*.tsbuildinfo`. Verificar com `git status --short` que `dev.db-shm`, `dev.db-wal` e `tsconfig.tsbuildinfo` não aparecem como não rastreados.

## 3. Configuração e imports

- [x] 3.1 Em `tsconfig.json`, trocar o alias para `"@/*": ["./src/*"]`. No `vitest.config.ts`, apontar o alias `@` para `src`. No `tailwind.config.ts`, deixar o `content` só com `./src/**/*.{js,ts,jsx,tsx}`. Verificar que `npm run typecheck` só reporta os imports relativos quebrados.
- [x] 3.2 Converter todos os imports que usam `../` (cerca de 40, em `src/app/api/**`, `src/components/**` e `src/app/page.tsx`) e os imports e mocks relativos de `__tests__/**` (`../../App`, `../../app/page`) para o alias `@/`. Verificar que `npm run typecheck` termina sem erros e que `grep -rn "from ['\"]\.\./" src __tests__` não retorna nada.
- [x] 3.3 Adicionar a regra `no-restricted-imports` com o padrão `../*` ao `.eslintrc.json`, com mensagem pedindo o alias `@/`. Verificar que `npm run lint` passa e que um import `../` criado de propósito é reprovado (desfazer em seguida).

## 4. Documentos que citam caminhos

- [x] 4.1 Atualizar para os novos caminhos o `CLAUDE.md` (seção Estrutura), o `DESIGN.md` (`App.tsx`, `components/*.tsx`, `index.css`, `constants.ts`), o `README.md`, a skill `.claude/skills/pokedex-ui/SKILL.md` (comando de inventário e menções a arquivos) e a referência à fonte em `openspec/regras/catalogo-pta2.md`. Verificar com `grep -rn -E "(^|[^/])(components/|lib/|App\.tsx|index\.css|conteudo/)" CLAUDE.md DESIGN.md README.md .claude openspec/regras` que nenhuma ocorrência aponta para local inexistente.

## 5. Verificação integrada

- [x] 5.1 Apagar `.next/` e `tsconfig.tsbuildinfo`, rodar `npm run check` (mesmo número de testes da tarefa 1.1) e `npm run build`. Verificar que ambos passam e que o CSS gerado em `.next/static/css` tem tamanho equivalente ao da linha de base.
- [x] 5.2 Rodar `npm run dev`, abrir `/` e `/admin`, e confirmar `GET /api/health` = 200, a página inicial = 200 e o visual com estilos (cor do tema, contornos e sombras). Confirmar que o `dev.db` e as imagens de `public/uploads` continuam sendo usados.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, retomar o programa com a fase 2: `rebuild-authentication`.
