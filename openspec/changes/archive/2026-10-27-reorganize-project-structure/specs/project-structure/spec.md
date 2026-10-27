# Spec Delta

## Purpose
Define onde cada tipo de arquivo mora no repositório e como os módulos se referenciam entre si, para que o projeto continue previsível conforme cresce e para que reorganizar pastas nunca altere o comportamento do app.

## ADDED Requirements

### Requirement: Código-fonte em src
Todo código-fonte da aplicação (rotas, componentes, bibliotecas, dados, constantes e tipos) SHALL ficar sob `src/`. A raiz do repositório MUST conter apenas arquivos de configuração e documentação de projeto, e as pastas `src/`, `prisma/`, `public/`, `scripts/`, `__tests__/` e `openspec/`.

#### Scenario: Raiz sem código solto
- **WHEN** a raiz do repositório é listada
- **THEN** não existe nenhum arquivo `.ts`, `.tsx` ou `.css` de aplicação na raiz além das configurações (`next.config.ts`, `tailwind.config.ts`, `vitest.config.ts`, `prisma.config.ts` e `next-env.d.ts`)
- **AND** não existem as pastas `app/`, `components/`, `lib/` nem `conteudo/` na raiz

#### Scenario: Arquivos de sobra removidos
- **WHEN** a raiz do repositório é listada
- **THEN** `metadata.json` e `Trainer Card Pro.session.sql` não existem
- **AND** `tsconfig.tsbuildinfo`, `dev.db-shm` e `dev.db-wal` não aparecem como arquivos não rastreados no git

### Requirement: Imports entre módulos pelo alias
Módulos da aplicação e dos testes SHALL se importar pelo alias `@/`, que resolve para `src/`. Imports que sobem diretórios com `../` MUST NOT ser usados; imports de um arquivo vizinho na mesma pasta (`./`) são permitidos.

#### Scenario: Import com subida de diretório
- **WHEN** um arquivo importa outro com um caminho que começa por `../`
- **THEN** `npm run lint` falha apontando o import

#### Scenario: Alias consistente entre ferramentas
- **WHEN** o TypeScript, o Next.js e o Vitest resolvem `@/lib/telemetry`
- **THEN** todos resolvem para `src/lib/telemetry.ts`

### Requirement: Reorganizar não muda o comportamento
Mover arquivos ou alterar caminhos de import MUST NOT alterar o comportamento nem o visual do app. Rotas, respostas de API, dados persistidos e estilos permanecem idênticos aos anteriores.

#### Scenario: Verificação automatizada
- **WHEN** `npm run check` é executado após a reorganização
- **THEN** typecheck, lint e testes passam, com o mesmo número de testes que passavam antes

#### Scenario: Build de produção
- **WHEN** `npm run build` é executado após a reorganização
- **THEN** o build termina sem erros, e as rotas `/`, `/admin` e `/api/*` continuam existindo

#### Scenario: Estilos preservados
- **WHEN** o app é aberto no navegador após a reorganização
- **THEN** as classes do Tailwind continuam sendo geradas para os componentes movidos, e o visual da tela inicial é o mesmo de antes

#### Scenario: Dados e uploads preservados
- **WHEN** o app é iniciado com o `.env` e o `dev.db` existentes
- **THEN** o banco é aberto sem alteração de `DATABASE_URL`, e as imagens já enviadas em `public/uploads` continuam acessíveis

### Requirement: Referências de caminho atualizadas
Os documentos de trabalho do projeto que citam caminhos de arquivos (`CLAUDE.md`, `DESIGN.md`, `README.md`, skills em `.claude/` e `openspec/regras/`) SHALL refletir os novos caminhos.

#### Scenario: Nenhuma referência para caminho antigo
- **WHEN** esses documentos são pesquisados por caminhos antigos (`components/`, `lib/`, `App.tsx`, `index.css`, `conteudo/` sem o prefixo `src/` ou `openspec/regras/fonte/`)
- **THEN** nenhuma ocorrência aponta para um local que não existe mais
