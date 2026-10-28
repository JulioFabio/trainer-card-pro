# Tasks

## 1. Esquema e conversão

- [ ] 1.1 Copiar `dev.db` para um backup (`dev.db.bak2`, ignorado pelo git), reescrever em `prisma/schema.prisma` os modelos `Pokemon` e `Item` e acrescentar `PokemonType`, `PokemonAbility`, `PokemonMove`, `PokemonCapability`, `PokemonStat`, `Talent` e `PcBox` (design D1), e aplicar com `npx prisma db push`. Se o Prisma pedir consentimento para perda de dados, perguntar ao Mestre. Verificar que `npx prisma validate` passa, que o cliente foi regenerado e que as tabelas novas existem e estão vazias.
- [ ] 1.2 Criar `src/lib/characterModel/schemas.ts` (design D2): forma comum de Pokémon, item, talento e caixa, nas versões estrita e tolerante, com as faixas e limites da spec. Testes dos cenários "Golpe com categoria inválida", "Campo desconhecido aninhado", "Posição fora da faixa", "Ref com caracteres inválidos", "Coleção acima do limite" e "Pokémon completo válido", e que a versão tolerante aceita o Pokémon padrão do `PokemonCreationSheet` e o `INITIAL_TRAINER_DATA`. Verificar que passam.
- [ ] 1.3 Criar `src/lib/characterModel/mapper.ts` (`decomposeSheet` e `assembleSheet`, puros) e uma fixture realista de ficha (itens, talentos, três Pokémon em caixas diferentes, dois na equipe, uma caixa renomeada). Testes dos cenários "Ficha vazia", "Ids usados pelo front", "Ida e volta com equipe e PC", "Duas posições iguais", "Equipe maior que seis", "Equipe com id desconhecido", "Ref repetido" e "Ficha sem listas no sheetData". Verificar que passam.

## 2. Fotos

- [ ] 2.1 Criar `src/lib/characterModel/photos.ts` (`PhotoStore` e a implementação em disco, design D5) com nome por hash do conteúdo, usando o `detectImageType` da fase 3 por injeção. Testes, com pasta temporária, dos cenários "Foto em base64", "Mesma foto no autosave seguinte", "Foto que não é imagem", "Foto grande demais" e "Foto já como caminho". Verificar que passam.

## 3. Armazenamento e rota de ficha

- [ ] 3.1 Criar `src/lib/characterModel/store.ts` com `saveCharacterSheet` (design D4: validação, fotos antes da transação, diff por `ref`, uma transação) e um auxiliar de teste que cria um SQLite temporário com `prisma db push`. Testes contra o banco real dos cenários "Salvar ficha com Pokémon", "Ficha sem listas no sheetData", "Ficha sem mudanças" (contando `total_changes()`), "Um Pokémon alterado", "Pokémon removido", "Falha no meio da gravação", "Apagar a ficha" e "Coleção acima do limite". Verificar que passam.
- [ ] 3.2 Acrescentar `loadCharacterSheet` e `migrateIfLegacy` (design D3 e D6) ao `store.ts`, com testes dos cenários "Ida e volta com equipe e PC", "Ficha antiga lida pela primeira vez" e "Segunda leitura" (sem duplicar registros). Verificar que passam.
- [ ] 3.3 Trocar o `sheetData` em `src/app/api/character/route.ts` (`GET`, `POST`, `PUT`) pelas funções do `store.ts`, mantendo o cache e as regras de acesso da fase 3, e remover o teto de 8 MB do `sheetData` do esquema da ficha (o corpo continua limitado a 10 MB). Atualizar `characterApi.test.ts` e `characterLogs.test.ts`. Verificar que passam e que a resposta do `GET` tem o mesmo formato de antes.

## 4. Rotas granulares

- [ ] 4.1 Reescrever `src/app/api/pokemon/route.ts` (design D7): `GET` por ficha e por id, `POST`, `PUT` parcial e `DELETE` com o modelo completo, posições em conflito dando `409`. Atualizar a matriz de acesso e acrescentar os cenários "Jogador lista os Pokémon de outro", "Leitura sem sessão", "Pokémon inexistente", "Escrita continua restrita" e "Pokémon completo válido". Verificar que passam.
- [ ] 4.2 Reescrever `src/app/api/item/route.ts` do mesmo modo (`GET` por ficha e por id, `ref` e `position`) e atualizar os testes correspondentes. Verificar que passam.

## 5. Seed e verificação

- [ ] 5.1 Ligar `allowImportingTsExtensions` no `tsconfig.json` se ainda não estiver, estender `scripts/seed-dev.ts` com a ficha rica do Túlio (design D9) e ensinar o `scripts/screenshots.mjs` a fotografar as abas Equipe, PC e Mochila como Túlio. Verificar que `npm run seed:dev` roda duas vezes sem duplicar nada e que `npm run typecheck` passa.
- [ ] 5.2 Rodar `npm run check` e `npm run build`. Com `npm run dev` e o seed aplicado: abrir a ficha do Túlio pelo app, editar um Pokémon e confirmar o indicador de salvamento; conferir no banco que o `sheetData` guardado não tem listas nem base64 e que os Pokémon estão nas tabelas; enviar por `curl` uma ficha com foto em base64 e confirmar o arquivo em `public/uploads`; medir o tempo de um `PUT` com 100 Pokémon. Rodar `npm run shots normalize-data-model` e comparar as abas Equipe, PC e Mochila com os prints anteriores. Registrar o resultado na tarefa.

## Workflow follow-up

- Revisar o diff e arquivar a change com `/opsx:archive` depois da revisão.
- Em seguida, propor a fase 5: `split-app-component` (que também adota os salvamentos granulares no front).
