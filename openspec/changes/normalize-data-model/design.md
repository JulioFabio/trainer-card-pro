# Design

## Context

Estado observado em 27/10/2026 (motivação em `proposal.md`):

- **Armazenamento:** `Character.sheetData` guarda o `TrainerData` inteiro: identidade, biografia, classes, atributos, perícias, `hpActual`, contadores, mais as listas `inventario` (`InventoryItem[]`), `talentos`, `equipe` (ids, no máximo 6, em ordem) e `pcBoxes` (99 caixas `{ id, name, pokemons }`). Cada `StoredPokemon` carrega as fotos em base64 (`imageUrl`).
- **Formato do Pokémon (`src/types.ts`):** `id`, `name`, `species`, `level`, `gender`, `types[]`, `ball`, `slot`, `imageUrl`, `nature`, `natureFeatures`, `elementalDamageBonus`, `capabilityTrait`, `abilities[]`, `stats` (total, `base` e `lvl`, 6 atributos cada), `hp`, `evasions`, `movements`, `capabilities` (`force`, `intelligence`, `jump` e `other[]`), `moves[]`.
- **Posições:** as caixas têm 30 posições (`PcTab`: 6 × 5). Os Pokémon da equipe vivem nas caixas; `equipe` só guarda os ids. Os ids do front são `Date.now().toString()`.
- **Como o front fala com a API:** `App.tsx` lê `GET /api/character` e salva com `PUT /api/character`, enviando o `sheetData` completo a cada edição (com atraso). Nenhum componente chama `/api/pokemon` nem `/api/item`.
- **Esquema atual:** `Pokemon` (`nickname`, `species`, `isParty`, `boxName`, `imageUrl`, `pokemonData` JSON) e `Item` (`name`, `description`, `quantity`, `imageUrl`) são rasos e sem uso real. As rotas granulares, da fase 3, validam com esquemas estritos e ids UUID.
- **Código já pronto para reaproveitar:** `detectImageType`, o limite de 5 MB e o caminho de uploads (`src/lib/api/imageUpload.ts`), `requireUser`, `loadCharacterForWrite`, `parseBody` e a invalidação do cache (fase 3).
- **Banco e Node:** o banco está limpo. O Node 24 roda TypeScript direto (o `seed:dev` já usa isso), mas só com imports relativos com extensão e sem o alias `@/`.

## Goals / Non-Goals

**Goals:**
- Pokémon, golpes, habilidades, tipos, capacidades, atributos, itens, talentos e caixas em tabelas, com integridade referencial.
- O front não muda: `GET`/`PUT /api/character` mantêm o formato, e uma ida e volta devolve a mesma ficha.
- Salvar só o que mudou, em uma transação.
- Fotos fora do banco, sem regravar a cada autosave.
- Migração de fichas antigas idempotente.

**Non-Goals:**
- Salvamentos granulares no front e divisão do `App.tsx` (fase 5).
- Mover Pokémon e itens quando uma troca é aceita.
- Apagar fotos órfãs (a foto de um Pokémon removido continua no disco).
- Tornar o resto do `sheetData` do treinador (atributos, perícias, bio) relacional: é um registro por ficha, sem listas com identidade.

## Decisions

### D1. Tabelas
Todas ligadas à ficha ou ao Pokémon com `onDelete: Cascade`:
- `Pokemon`: `id` (UUID), `ref`, `characterId`, `boxNumber` (1–99), `slot` (0–29), `partySlot` (0–5, opcional), `nickname`, `species`, `level`, `gender`, `ball`, `imageUrl` (opcional), `nature`, `natureFeatures`, `elementalDamageBonus`, `traitName`, `traitDescription`, `hpCurrent`, `hpMax`, `evasionPhysical`, `evasionSpecial`, `evasionSpeed`, `moveLand`, `moveFly`, `moveSwim`, `moveUnderwater`, `moveBurrow`, e `forceValue`/`forceDescription`, `intelligenceValue`/`intelligenceDescription`, `jumpValue`/`jumpDescription`. Únicos: `(characterId, ref)`, `(characterId, boxNumber, slot)` e `(characterId, partySlot)` (o SQLite aceita vários `NULL`).
- `PokemonType` (`position`, `type`), `PokemonAbility` (`position`, `name`, `description`), `PokemonMove` (`position`, `ref`, `name`, `type`, `category`, `frequency`, `range`, `damage`, `accuracy`, `descriptor`, `description`; `ref` único por Pokémon), `PokemonCapability` (`position`, `name`, `value`) e `PokemonStat` (`kind` = `total` | `base` | `lvl`, e as seis colunas de atributos; único por Pokémon e `kind`).
- `Item`: `id`, `ref`, `position`, `name`, `description`, `quantity`, `imageUrl`; `(characterId, ref)` único.
- `Talent`: `id`, `position`, `name`, `description`.
- `PcBox`: `id`, `number` (1–99), `name`; `(characterId, number)` único. Só existe linha para caixa com nome diferente de "Box N".
- *Alternativa:* colunas de estatísticas dentro de `Pokemon` (18 colunas). Mais simples, mas a tabela `PokemonStat` mantém as três colunas de leitura juntas e evita nomes como `statBaseAtqEspecial`.

### D2. Organização do código em `src/lib/characterModel/`
- `schemas.ts`: esquemas zod. Uma forma comum do Pokémon, item, talento e caixa gera duas versões: **estrita** (rotas granulares, campo desconhecido é `400`) e **tolerante** (fachada: ignora campos desconhecidos e preenche padrões, para não rejeitar o que o front envia hoje).
- `mapper.ts`: funções puras. `decomposeSheet` transforma o `TrainerData` em registros planos; `assembleSheet` faz o caminho inverso, em ordem estável.
- `photos.ts`: `PhotoStore` (interface) e a implementação em disco.
- `store.ts`: `saveCharacterSheet`, `loadCharacterSheet`, `migrateIfLegacy`, recebendo o cliente do Prisma como argumento.
- Para o `seed:dev` rodar no Node puro, esses módulos não importam `@/...`: usam `import type` para tipos e imports entre irmãos com extensão `.ts` (liga `allowImportingTsExtensions`, que já é permitido porque o `tsconfig` tem `noEmit`). As fotos entram por injeção (`PhotoStore`), então o `store.ts` não depende de `imageUpload.ts`.
- *Alternativa:* usar o alias e rodar o seed pela API. Exigiria o servidor no ar e uma sessão só para popular o banco.

### D3. Leitura: `assembleSheet`
O `sheetData` devolvido é o JSON reduzido mais `inventario`, `talentos`, `equipe` e `pcBoxes` montados das tabelas. As 99 caixas são sempre devolvidas (nome padrão "Box N" quando não há linha). Os Pokémon de uma caixa vêm por `slot`; a `equipe` vem por `partySlot`. `StoredPokemon.id` recebe o `ref`, e `moves[].id` o `ref` do golpe. Campos opcionais ausentes (`imageUrl`) são omitidos, não devolvidos como `null`, para a ida e volta ser equivalente.

### D4. Gravação: `saveCharacterSheet` com diff
Em `prisma.$transaction` (com prazo de 20 s) e nesta ordem:
1. Valida tudo com o esquema tolerante e as regras de integridade: posições únicas, equipe de até 6 sem repetição, `ref` único, limites de coleção. Ids da equipe sem Pokémon correspondente são descartados.
2. Resolve as fotos (D5) **antes** de abrir a transação. Qualquer foto inválida interrompe tudo sem tocar o banco.
3. Carrega o que existe e compara, por `ref`, uma forma canônica (JSON com chaves em ordem fixa) de cada Pokémon, item e talento: igual não escreve; diferente atualiza o Pokémon e recria seus filhos; ausente no recebido é apagado; novo é criado.
4. Grava as caixas renomeadas (apagando as que voltaram ao nome padrão) e o `sheetData` reduzido.
A comparação reaproveita `assembleSheet` sobre o que está no banco, então "o que muda" e "o que o front vê" não divergem.

### D5. Fotos em `photos.ts`
Reconhece `data:image/<tipo>;base64,<dados>`, decodifica (recusa mais de 5 MB, `413`), confere a assinatura com `detectImageType` (o tipo declarado é ignorado; SVG e HTML não passam, `400`) e grava em `public/uploads/<ficha>/<hash>.<ext>`, com `<hash>` do SHA-256 do conteúdo. Se o arquivo já existe, não regrava; assim o autosave com a mesma foto em base64 não gera arquivos novos. Valores que já são `''`, `/uploads/...` ou `http(s)://...` passam sem alteração; qualquer outra coisa é `400`. Os arquivos são gravados antes da transação; se a transação falhar, sobra um arquivo órfão inofensivo (fora de escopo limpar).

### D6. Migração preguiçosa
`migrateIfLegacy` roda no início de toda leitura da ficha (rota de ficha e `GET`s granulares): se o `sheetData` guardado ainda tem `inventario`, `talentos`, `equipe` ou `pcBoxes`, chama `saveCharacterSheet` com esse conteúdo (que já é o formato de entrada). Como a gravação é um diff, repetir é seguro. Se duas leituras migrarem ao mesmo tempo, a segunda dentro da transação já vê tudo gravado, ou perde na restrição de unicidade e repete a leitura.

### D7. Rotas granulares
- `GET /api/pokemon?characterId=` lista os Pokémon da ficha, e `?id=` devolve um; `POST`/`PUT`/`DELETE` como na fase 3, agora com o modelo completo. O `POST` define `ref` no servidor (um UUID); o `PUT` aceita campos parciais e, nas listas aninhadas (golpes, habilidades etc.), substitui a lista inteira quando ela vem. Posições (`boxNumber`, `slot`, `partySlot`) em conflito dão `409`. A regra "só o GM move para outra ficha" continua.
- `GET /api/item?characterId=` e `?id=`; `POST`/`PUT`/`DELETE` com `ref` e `position`.
- Fotos nas rotas granulares seguem a regra da fase 3: só caminho `/uploads/` ou `http(s)`; o envio de arquivo continua em `/api/upload`.
- *Alternativa:* aceitar base64 também aqui. Duplicaria a validação de imagem; o front da fase 5 já terá `/api/upload`.
- Não há rotas separadas para equipe e caixas: `partySlot`, `boxNumber` e `slot` do Pokémon cobrem isso.

### D8. Verificação com banco real
Os testes de armazenamento usam um SQLite temporário criado com `prisma db push` no `beforeAll` (como o teste do cliente Prisma da fase 1), porque mocar o Prisma esconderia justamente o que importa: restrições de unicidade, cascata e transação. A conta de escritas da "gravação só do que mudou" usa `SELECT total_changes()`.

### D9. Seed rico
`scripts/seed-dev.ts` ganha uma ficha de teste para o Túlio: 3 Pokémon na equipe, mais outros no PC em duas caixas (uma renomeada), 4 itens e 2 talentos, montada com `saveCharacterSheet`. O `scripts/screenshots.mjs` passa a fotografar as abas Equipe, PC e Mochila como Túlio.

## Risks / Trade-offs

- [O formato que o front envia tem alguma forma que o esquema tolerante recusa e o salvamento passa a falhar] → Os testes usam o Pokémon padrão do `PokemonCreationSheet` e o `INITIAL_TRAINER_DATA`; o esquema tolerante preenche padrões em vez de recusar; a verificação final abre o app de verdade e confere o indicador de salvamento.
- [Números fracionários ou fora de faixa vindos de `SmartInput`] → Faixas amplas e arredondamento para inteiro na fachada; as faixas ficam documentadas no esquema.
- [Salvar uma ficha com milhares de Pokémon fica lento, porque a comparação monta tudo] → Limite de 3.000 Pokémon e prazo da transação; a medição na verificação final usa uma ficha de tamanho realista (100 Pokémon). Se ficar lento, o diff pode passar a usar um hash por Pokémon guardado no banco.
- [Fotos órfãs acumulam em `public/uploads`] → Aceito e registrado; a limpeza fica para depois (as imagens por hash ocupam pouco e se repetem).
- [A forma do `Pokemon` muda e `prisma db push` aciona o guarda de perda de dados] → As tabelas estão vazias; faço backup e peço o consentimento explícito ao Mestre, como na fase 2, se o Prisma pedir.
- [Dois Pokémon do front com o mesmo `Date.now()`] → O `ref` repetido é recusado com erro claro; hoje isso já sobrescreveria um Pokémon em silêncio.
- [`$transaction` interativa com o adaptador do SQLite] → Coberta pelos testes de falha no meio da gravação.

## Migration Plan

1. Backup de `dev.db`, novo `prisma/schema.prisma` e `prisma db push`.
2. Implementar mapeador, fotos e armazenamento com testes; trocar as rotas.
3. Rodar o `seed:dev` e verificar com o app e os prints.

Rollback: reverter os commits e restaurar o backup do `dev.db`. Fichas gravadas já no formato novo não existem no modelo antigo; como não há dados reais hoje, isso não perde nada.

## Open Questions

- Quando o front da fase 5 passar a salvar por Pokémon, ele deve usar o `ref` ou o `id` do servidor? O `ref` continua válido, então a decisão pode esperar.
