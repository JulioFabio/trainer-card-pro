# 🗺️ [Roadmap] Fase 1 - Banco de Dados Local (SQLite)

> **[SISTEMA DE CHECKPOINT E CONTINUIDADE ATIVADO]**
> Ao ler este arquivo, o Assistente de IA deve:
> 1. Identificar a PRIMEIRA tarefa não marcada com `[x]`.
> 2. Executar APENAS essa tarefa (criando código e atualizando os `.md` do Vault Map).
> 3. Parar a geração e perguntar: "Etapa X concluída. Posso marcar com [x] e prosseguir para a próxima?"

## 🗄️ Etapa 1: Setup do Servidor e Banco de Dados
- [ ] Instalar as dependências do Prisma ORM (`prisma`, `@prisma/client`).
- [ ] Criar o arquivo `schema.prisma` com a estrutura Híbrida (Modelos: `User`, `Character`, `Item`, `Pokemon`, `TradeRequest`, `Note`).
- [ ] Implementar a lógica de migração/setup inicial no `README.md` (`npx prisma db push`).
- [ ] **Documentação:** Criar `[Arquitetura] Banco de Dados.md` e linkar no `Vault Map`.

## 🧬 Etapa 2: Refatoração de Tipos (`types.ts`)
- [ ] Atualizar as interfaces em `types.ts` para separar as entidades de `User` (Jogador) e `Character` (Personagem).
- [ ] Remover a dependência estrita do `TrainerData` ser salvo no `localStorage` inteiro, preparando-o para receber o ID do banco.

## 💾 Etapa 3: Integração Backend (Rotas de API)
- [ ] Criar os endpoints do servidor para buscar (GET) e salvar (PUT/POST) o `TrainerData` no banco SQLite usando a estratégia de `sheetData` (JSON formatado em string).
- [ ] Criar rota de Upload de Imagem física para a pasta `/uploads/`.
- [ ] **Documentação:** Criar `[Rotas] API Interna.md` detalhando os endpoints.

## 🖼️ Etapa 4: Refatoração do Upload de Imagens (`ImageCropper.tsx`)
- [ ] Modificar o fluxo de upload atual. Em vez de salvar a string Base64 direto no estado `avatar` ou `imageUrl` do Pokémon, o front-end deve enviar o Base64 para a nova Rota de Upload e salvar o *caminho do arquivo* retornado pelo servidor.

## 📦 Etapa 5: Refatoração de PC, Equipe e Inventário
- [ ] Adaptar o `App.tsx` (Auto-save) para disparar requisições à API ao invés de usar `localStorage`.
- [ ] Adaptar a lógica do `PcTab.tsx` e `TeamTab.tsx` para garantir que mover um Pokémon apenas atualize o banco de dados (relacionamento `boxName` e `isParty`), mantendo o ID do `StoredPokemon`.

## 📝 Etapa 6: Sistema de Anotações (`NotesTab.tsx`)
- [ ] Adaptar o `NotesTab.tsx` para ler e salvar as anotações não mais no estado gigante do `TrainerData`, mas como registros individuais na nova tabela `Note` atrelada ao `characterId`.