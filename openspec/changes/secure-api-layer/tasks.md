# Tasks

## 1. Base: erros, sessão, validação

- [ ] 1.1 Instalar `zod`. Criar `src/lib/api/errors.ts` com `HttpError`, e fazer o `withTelemetry` (`src/lib/telemetry.ts`) converter `HttpError` em `{ error }` com o status dele (4xx em `warn` com identificadores e sem corpo; 5xx como hoje). Testes: `HttpError` vira a resposta certa, erro comum continua `500` com `requestId`, e o log de uma recusa não contém o corpo enviado. Verificar que passam.
- [ ] 1.2 Criar `src/lib/api/access.ts` com `requireUser` (sessão + usuário e papel lidos do banco), `canWrite` e `loadCharacterForWrite` (design D1). Testes dos cenários "Requisição sem sessão", "Perfil removido", "Papel alterado no banco", "Ficha inexistente" e "Jogador altera a ficha de outro". Verificar que passam.
- [ ] 1.3 Criar `src/lib/schemas.ts` e `src/lib/api/parse.ts` (`parseBody`, `parseQuery`) conforme design D2: esquemas estritos para ficha, item, nota, Pokémon e troca, validador de endereço de imagem, limites de tamanho e mensagens em pt-BR sem eco dos valores. Testes dos cenários "Corpo com tipo errado", "Corpo que não é JSON", "Campo obrigatório ausente", "Tentativa de definir o dono", "Identificador definido pelo cliente", "Ficha grande demais", "Nível fora da faixa", "Endereço com script" e "Caminho de upload". Verificar que passam.

## 2. Rotas de ficha

- [ ] 2.1 Migrar `src/app/api/character/route.ts` para os helpers: `requireUser`, leitura aberta por `id`, lista própria sem `id`, `scope=all` com resumo, criação sem `id` do cliente e sem `user.upsert`, e `PUT` com `loadCharacterForWrite`. Criar `invalidateCharacter` e usá-lo nas escritas. Atualizar os testes de `character` (unit e integration) para a leitura aberta e acrescentar "Jogador lê a ficha de outro", "Lista sem identificador", "Ficha inexistente" e "Nível fora da faixa". Verificar que passam.
- [ ] 2.2 Migrar `note`, `item` e `pokemon` (design D4): `loadCharacterForWrite` na criação, no registro existente na alteração e na exclusão, `404` para registro inexistente, mudança de `characterId` do Pokémon só para o GM, e `invalidateCharacter` em cada escrita. Testes da matriz (visitante, jogador de fora, dono, GM) para as três rotas e dos cenários "Item, nota ou Pokémon de outra ficha por identificador", "Jogador tenta mover um Pokémon", "Registro inexistente" e "Escrita em item invalida a leitura". Verificar que passam.

## 3. Trocas e upload

- [ ] 3.1 Migrar `src/app/api/trade/route.ts` (design D5), com resposta condicional `PENDING` atômica e `409`. Testes dos cenários "Proposta feita pelo dono do remetente", "Proposta em nome de outro", "Destinatário inexistente ou igual ao remetente", "Destinatário responde", "Outro jogador tenta responder", "Troca já respondida" e "Estado inválido", além do acesso sem sessão. Verificar que passam.
- [ ] 3.2 Criar `src/lib/api/imageUpload.ts` (detecção por assinatura, extensão, nome gerado, conferência do caminho) e migrar `src/app/api/upload/route.ts` (design D6). Testes, com uma pasta temporária, dos cenários "Sem sessão", "Ficha de outro jogador", "Ficha inexistente", "Imagem válida", "Arquivo disfarçado", "Tipo não permitido", "Arquivo grande", "Identificador com travessia de caminho", "Nome enviado é ignorado" e "Endereço devolvido". Verificar que passam.
- [ ] 3.3 Acrescentar ao `next.config.ts` o cabeçalho `X-Content-Type-Options: nosniff` para `/uploads/:path*`. Verificar com `curl -I` em um arquivo enviado.

## 4. Front e verificação

- [ ] 4.1 Em `src/components/TradeModal.tsx`, trocar a lista fictícia de personagens por `GET /api/character?scope=all` sem a ficha da própria pessoa, sem alterar marcação nem estilo. Verificar com `npm run typecheck` e abrindo o modal no servidor de dev.
- [ ] 4.2 Rodar `npm run check` e `npm run build`. Com `npm run dev`, percorrer com `curl` e sessões reais (Mestre local, Túlio e Robert do `seed:dev`): toda rota de dados sem sessão = `401`; Túlio lê a ficha de Robert (`200`) e não consegue alterá-la, nem seus itens, notas ou Pokémon (`403`); o GM consegue; upload de PNG verdadeiro funciona e HTML com nome `.png`, `../` no identificador e arquivo de 6 MB são recusados; sessão de perfil removido recebe `401`. Abrir o app e confirmar que a ficha carrega, salva e que a proposta de troca funciona. Registrar o resultado na tarefa.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, propor a fase 4: `normalize-data-model` (que também tira as fotos de dentro do `sheetData`).
