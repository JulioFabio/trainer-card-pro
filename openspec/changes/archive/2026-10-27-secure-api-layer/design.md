# Design

## Context

Estado observado em 27/10/2026 (motivação em `proposal.md`):

- **Rotas:** `character` (GET, POST, PUT), `item`, `note`, `pokemon` (POST, PUT, DELETE), `trade` (GET, POST, PUT), `upload` (POST), `health`. Só `character` chama `auth()`. As demais usam o corpo direto: `const { ... } = await request.json()` e passam para o Prisma. `DELETE` recebe o `id` na query.
- **Quem chama o quê (front):** `App.tsx` usa `GET`/`POST`/`PUT /api/character`; `NotesTab` usa `GET /api/character?id=` e `POST`/`PUT /api/note`; `TradeModal` usa `GET`/`POST`/`PUT /api/trade`, com uma **lista fictícia** de personagens (`char-123`, `rival-456`); `ImageCropper` usa `POST /api/upload` com `file` e `characterId`. Nenhum componente chama `/api/item` nem `/api/pokemon`: itens e Pokémon vivem hoje dentro do `sheetData` (fase 4 os leva para as tabelas).
- **`sheetData`:** as fotos dos Pokémon (`StoredPokemon.imageUrl`) são guardadas em base64 dentro dele (`types.ts`, `PokemonCreationSheet`). Uma ficha com várias fotos passa facilmente de 1 MB.
- **Sessão:** JWT de 3 h. `session.user.role` vem do token. `POST /character` faz `user.upsert` com o id da sessão, o que recria um usuário removido.
- **Cache:** `memoryCache` guarda `character:<id>` por 10 s e a leitura repete a checagem de dono por cima do valor em cache. Só `PUT /character` invalida; escritas em item, nota e Pokémon não.
- **Erros:** `withTelemetry` captura qualquer exceção como `500 { error: 'Erro interno do servidor', requestId }`. Um JSON inválido hoje vira `500`.
- **Testes atuais:** os testes de `character` mocam `withTelemetry` como passagem direta e `@/auth`. Os de `health` e `characterLogs` usam a telemetria real.

## Goals / Non-Goals

**Goals:**
- API fechada a quem não entrou; escrita só do dono ou do GM; leitura aberta a logados.
- Nenhuma escrita fora de `public/uploads`; nenhum arquivo que não seja imagem.
- Regras de acesso e validação em um só lugar, com rotas finas.
- O app continua funcionando sem mudança visual.

**Non-Goals:**
- Reestruturar `sheetData`, mover fotos para arquivos ou criar tabelas novas (fase 4).
- Mover o Pokémon de verdade quando uma troca é aceita: hoje a troca só muda de estado, e continua assim.
- Limitar requisições por IP.
- Defender contra um jogador que entra no perfil de outro de propósito (decisão da mesa).

## Decisions

### D1. `HttpError` e helpers em `src/lib/api/`
Um `HttpError(status, message)` lançado pelos helpers e convertido em `{ error }` pelo `withTelemetry`, que hoje só conhece o `500`. Isso deixa as rotas lineares (sem `if (!ok) return`) e uniformiza o formato. `4xx` é registrado em `warn` com identificadores, sem corpo; `5xx` continua em `error`.
Helpers:
- `requireUser()`: chama `auth()`, depois consulta `user.findUnique({ id })` e devolve `{ id, role }` **do banco**. Sem sessão ou sem usuário → `401`. Resolve o perfil removido e o papel alterado.
- `canWrite(user, ownerId)`: `user.role === 'GM' || user.id === ownerId`.
- `loadCharacterForWrite(user, characterId)`: busca `{ id, userId }`, `404` se não existe, `403` se não pode escrever.
- `parseBody(request, schema)` e `parseQuery(...)` (D2).
- `invalidateCharacter(id)` (D3).
- *Alternativa:* camada de serviços completa (`CharacterService`, `ItemService`...). Descartada: o código das rotas tem ~50 linhas cada, e a fase 4 vai mudar as consultas; uma camada agora seria reescrita logo depois.

### D2. Validação com `zod`
Esquemas em `src/lib/schemas.ts`, todos `.strict()` (campo desconhecido → `400`; é o que impede definir `userId` ou `id`). `parseBody` lê o texto da requisição, recusa corpo maior que 10 MB com `413`, falha de `JSON.parse` com `400` e converte o primeiro problema de validação em `{ error }` pt-BR no formato `Campo "level": deve ser um número inteiro entre 1 e 100.`, sem repetir o valor enviado. Para `sheetData`, `pokemonData` e `tradeData` a forma interna não é validada (é opaca até a fase 4): só precisa ser objeto e caber no tamanho (8 MB, 1 MB, 1 MB). Endereços de imagem usam um validador comum (vazio, `/uploads/...` ou `http(s)` até 2.048 caracteres).
- *Alternativa:* validadores escritos à mão. Menos uma dependência, mas mais código para errar e mensagens inconsistentes; `zod` é padrão no ecossistema TypeScript.

### D3. Leitura aberta e cache simples
`GET /character?id=` passa a exigir só sessão. O cache deixa de repetir a checagem de dono, já que o valor é igual para todos. Toda escrita em ficha, item, nota ou Pokémon chama `invalidateCharacter(characterId)`. `GET /character` sem `id` continua devolvendo as fichas do usuário logado (é o que o `App` usa para achar a ficha dele; o GM também recebe só as dele). Novo `GET /character?scope=all` devolve um resumo (`id`, `name`, `avatarUrl`, nome do dono) de todas as fichas, para o seletor de destinatário das trocas.

### D4. Rotas de item, nota e Pokémon
Criar: `characterId` vem no corpo → `loadCharacterForWrite`. Alterar e apagar: busca o registro com o `characterId` dele → `loadCharacterForWrite` do dono atual. No `PUT /pokemon`, mudar `characterId` só é aceito para o GM (o destino precisa existir). O `DELETE` continua com o `id` na query, validado como identificador.
- Itens e Pokémon não têm chamada no front hoje; protegê-los é custo baixo e fecha a porta.

### D5. Trocas
`POST`: `senderId` e `receiverId` validados, diferentes, ambos existentes; `loadCharacterForWrite(user, senderId)`. `PUT`: o corpo só aceita `id` e `status` ∈ {`ACCEPTED`, `REJECTED`}; busca a troca (`404`), exige escrita na ficha destinatária (`403`) e faz `updateMany({ where: { id, status: 'PENDING' } })`; se nenhum registro mudou, responde `409`. A condição `PENDING` na própria escrita evita que duas respostas simultâneas passem. `GET`: qualquer logado, com o `characterId` validado.

### D6. Upload
Ordem: sessão → corpo de formulário → `characterId` no formato de identificador (UUID) → ficha existe e pode escrever → tamanho (`file.size` ≤ 5 MB, `413`) → leitura do conteúdo → detecção por assinatura (PNG `89 50 4E 47 0D 0A 1A 0A`, JPEG `FF D8 FF`, GIF `GIF87a`/`GIF89a`, WebP `RIFF....WEBP`) → grava `public/uploads/<characterId>/<uuid>.<ext>`. O tipo declarado pelo cliente e o nome enviado são ignorados. Antes de gravar, o caminho resolvido é conferido: precisa começar por `public/uploads/`. Para endurecer a entrega, o `next.config.ts` passa a enviar `X-Content-Type-Options: nosniff` em `/uploads/:path*`.
- *Alternativa:* aceitar SVG sanitizado. Descartada: o recorte do avatar (`ImageCropper`) já gera PNG, e SVG é o formato que mais carrega script.

### D7. Identificadores gerados pelo servidor
`POST /character` deixa de aceitar `id` do cliente e de fazer `user.upsert` (o `requireUser` já garante que o usuário existe). O `App` não envia `id` na criação, então nada muda para ele.

### D8. Ajuste do front
`TradeModal.fetchCharacters` troca a lista fictícia por `GET /api/character?scope=all`, removendo a ficha da própria pessoa. Nenhuma marcação nem estilo muda.

### D9. Testes
Uma matriz por rota: visitante, jogador de fora, dono e GM × leitura e escrita, usando a telemetria real (só o `logger` é espionado) para exercitar o mapeamento de `HttpError`. Testes próprios para `requireUser` (perfil removido, papel do banco), `parseBody` (JSON inválido, campo extra, limites), as assinaturas de imagem e a travessia de caminho no upload (com pasta temporária). Os testes de `character` que esperam `403` na leitura alheia passam a esperar `200`.

## Risks / Trade-offs

- [Validação estrita rejeita algo que o front envia] → Levantar o que cada chamada envia (já feito para `character`, `note`, `trade`, `upload`) e cobrir com um teste que usa o mesmo formato; checar o app com o servidor de dev na tarefa final.
- [Uma consulta extra ao banco por requisição (`requireUser`)] → SQLite local com chave primária; custo desprezível para uma mesa.
- [`sheetData` de 8 MB é grande] → É um teto de segurança, não uma meta; a fase 4 tira as fotos da ficha e o teto cai.
- [A leitura aberta expõe notas pessoais a todos os jogadores] → Escolha explícita do mestre; quem quiser privacidade volta para "só a própria" mudando uma regra em `canRead`.
- [Quem tem um token antigo de perfil removido recebe `401` e o `App` mostra "Voltar à tela de entrada"] → Comportamento esperado; já existe esse caminho no `App`.
- [A troca aceita só muda o estado, não move Pokémon] → Já era assim; a mecânica real de troca fica para a fase 4.
- [O `nosniff` e a restrição de tipo não protegem arquivos já em `public/uploads`] → O banco foi zerado na fase 2; os uploads antigos são de fichas que não existem mais.

## Migration Plan

1. Instalar `zod`, criar helpers e esquemas, e migrar uma rota por vez (`character`, `note`, `item`, `pokemon`, `trade`, `upload`), cada uma com seus testes.
2. Ajustar o `TradeModal` e o `next.config.ts`.
3. Verificar com o servidor de dev, usando `curl` com e sem sessão e o app no navegador.

Rollback: reverter os commits; não há mudança de esquema nem de dados.

## Open Questions

- Nenhuma que mude o plano. O destino real dos arquivos antigos em `public/uploads` (que ficaram órfãos com o banco zerado) pode ser limpo na fase 4.
