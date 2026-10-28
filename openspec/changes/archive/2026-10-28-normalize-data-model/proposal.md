# Proposal

## Why

Quase tudo que a ficha guarda mora em um único campo de texto, `Character.sheetData`: a identidade do treinador, o inventário, os talentos, a equipe, as 99 caixas do PC com todos os Pokémon e as **fotos dos Pokémon em base64**. Cada salvamento reescreve esse bloco inteiro, que pode chegar a vários megabytes e já precisou de um teto de 8 MB na fase 3. O banco não consegue responder a nada sobre esses dados (quais Pokémon existem, quais itens, quem tem o quê), não tem integridade (a equipe aponta para ids que podem não existir) e não permite alterar um Pokémon sem regravar a ficha toda.

Existem tabelas `Item` e `Pokemon` no esquema, mas são rasas (o Pokémon guarda quase tudo em um JSON `pokemonData`) e o app não as usa; as rotas `/api/pokemon` e `/api/item` trabalham sobre elas e ficam sem uso real.

Esta é a fase 4 de 5. O banco está limpo desde a fase 2, então este é o melhor momento para trocar o modelo sem migrar dados de produção. O front continua intacto: a divisão do `App.tsx` e os salvamentos granulares são da fase 5.

## What Changes

- **Pokémon totalmente normalizado.** Tabelas próprias para o Pokémon (campos escalares, posição na caixa e na equipe), seus tipos, habilidades, golpes, capacidades extras e atributos (total, base e por nível). Nada de JSON para o que tem estrutura conhecida.
- **Itens, talentos e caixas do PC em tabelas.** O `Item` passa a espelhar o `InventoryItem`; `Talent` é nova; `PcBox` guarda só o nome das caixas renomeadas (as 99 caixas padrão não ocupam linha).
- **Cada item, Pokémon e golpe tem um `ref`** (o id que o front usa hoje, como `Date.now()`), único por ficha, além do id UUID do servidor. As referências da equipe e das caixas continuam funcionando.
- **`sheetData` reduzido** ao que sobra do treinador: identidade, biografia, classes, atributos, perícias, vida e contadores.
- **Fachada de compatibilidade.** `GET /api/character` monta o mesmo formato de antes a partir das tabelas, e `PUT /api/character` decompõe o `sheetData` recebido em uma transação, gravando só as linhas que mudaram. O front não percebe a troca; GET → PUT → GET devolve a mesma ficha.
- **Fotos viram arquivos.** Uma foto em base64 recebida no `PUT` é validada (PNG, JPEG, WebP ou GIF pelo conteúdo, até 5 MB), gravada em `public/uploads/<ficha>/` com nome derivado do conteúdo (não regrava a cada autosave) e o `imageUrl` passa a ser o caminho `/uploads/...`.
- **Rotas granulares completas.** `/api/pokemon` e `/api/item` passam a ler e gravar o modelo completo (esquema estrito aninhado), com `GET` por ficha aberto a quem está logado e escrita só do dono ou do GM (regras da fase 3 mantidas).
- **Migração preguiçosa e idempotente** de fichas antigas (com inventário, equipe e PC embutidos no `sheetData`): na primeira leitura elas são decompostas nas tabelas, sem perder nada.
- **Seed e prints.** O `npm run seed:dev` passa a criar uma ficha de teste rica (equipe, PC, itens) pelas mesmas funções, para os prints das abas Equipe, PC e Mochila deixarem de sair vazios.

Fora de escopo: salvamentos granulares no front e divisão do `App.tsx` (fase 5), mover Pokémon e itens de verdade quando uma troca é aceita, limpeza de fotos órfãs e empacotamento.

## Capabilities

### New Capabilities

- `character-data-model`: como a ficha é guardada (entidades em tabelas, `sheetData` reduzido), como ela é lida e gravada com o formato de sempre, como fotos e fichas antigas são tratadas e quais limites e garantias de integridade existem.

### Modified Capabilities

- `api-access-control`: acrescenta a leitura aberta de Pokémon e itens por ficha nas rotas granulares.
- `request-validation`: acrescenta o esquema estrito e completo de Pokémon e item, e os limites das coleções.

## Impact

- **Banco:** `prisma/schema.prisma` ganha `Talent`, `PcBox`, `PokemonType`, `PokemonAbility`, `PokemonMove`, `PokemonCapability` e `PokemonStat`; `Pokemon` e `Item` mudam de forma (colunas do modelo antigo saem). Aplicado com `prisma db push` depois de backup do `dev.db`; como as tabelas estão vazias, nenhum dado é perdido.
- **Código:** novos módulos em `src/lib/characterModel/` (esquemas, conversão entre formato do front e linhas, gravação com diff, leitura, migração, fotos); `src/app/api/character`, `src/app/api/pokemon` e `src/app/api/item` reescritas sobre eles; `scripts/seed-dev.ts`.
- **Testes:** novos testes de conversão, de round-trip contra um SQLite temporário real, de fotos, das rotas granulares e da migração; a matriz de acesso das rotas de Pokémon e item é atualizada.
- **Front:** nenhuma mudança de código ou de aparência.
- **Dependências:** nenhuma nova.
- **Arquivos locais:** novas imagens em `public/uploads/<ficha>/` (já ignorado pelo git).
