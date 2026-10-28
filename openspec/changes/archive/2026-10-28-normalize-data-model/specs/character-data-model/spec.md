# Spec Delta

## Purpose
Define como a ficha de personagem é guardada no banco (entidades em tabelas próprias e um `sheetData` reduzido), como ela continua sendo lida e gravada no formato que o app já usa, e que garantias de integridade, de fotos e de migração existem.

## ADDED Requirements

### Requirement: Entidades da ficha em tabelas próprias
O sistema SHALL guardar cada Pokémon, e também seus tipos, habilidades, golpes, capacidades extras e atributos (total, base e por nível), cada item do inventário, cada talento e cada caixa do PC renomeada em registros próprios ligados à ficha. O campo `sheetData` MUST conter apenas os dados do treinador que não são listas com identidade (identidade, biografia, classes, atributos, perícias, vida e contadores) e MUST NOT conter inventário, talentos, equipe, caixas do PC nem fotos.

#### Scenario: Salvar ficha com Pokémon
- **WHEN** uma ficha com um Pokémon de dois tipos, três golpes e uma habilidade é salva
- **THEN** existe um registro de Pokémon com dois tipos, três golpes e uma habilidade ligados a ele, e o `sheetData` guardado não contém esses dados

#### Scenario: Ficha sem listas no sheetData
- **WHEN** qualquer ficha é salva
- **THEN** o `sheetData` guardado não contém as chaves `inventario`, `talentos`, `equipe` nem `pcBoxes`

### Requirement: Formato de leitura inalterado
A leitura da ficha (`GET /api/character`) SHALL devolver o mesmo formato que o app já consome: um `sheetData` completo com `inventario`, `talentos`, `equipe` e `pcBoxes`, montado a partir das tabelas. A equipe SHALL ser a lista dos ids dos Pokémon na ordem da equipe, e `pcBoxes` SHALL ter sempre as 99 caixas numeradas de 1 a 99, cada uma com seu nome e seus Pokémon em ordem de posição.

#### Scenario: Ficha vazia
- **WHEN** uma ficha nova é lida
- **THEN** o `sheetData` tem `inventario`, `talentos` e `equipe` vazios e 99 caixas chamadas "Box 1" a "Box 99", sem Pokémon

#### Scenario: Ids usados pelo front
- **WHEN** a ficha usa ids como `"1730000000000"` para Pokémon e itens
- **THEN** a leitura devolve exatamente esses ids, e a equipe continua referenciando os Pokémon por eles

### Requirement: Ida e volta equivalente
A gravação (`PUT /api/character`) SHALL aceitar o mesmo formato que a leitura devolve. Gravar uma ficha e lê-la de volta MUST devolver uma ficha equivalente à enviada, exceto pela ordem dos Pokémon dentro de uma caixa, que segue a posição.

#### Scenario: Ida e volta com equipe e PC
- **WHEN** uma ficha com itens, talentos, três Pokémon em caixas diferentes e dois deles na equipe é gravada e lida de volta
- **THEN** a ficha lida é equivalente à gravada, incluindo posições, nomes de caixa e a ordem da equipe

### Requirement: Gravação só do que mudou
A gravação da ficha SHALL ocorrer em uma única transação: se qualquer parte falhar, nada é alterado. O sistema SHALL comparar o conteúdo recebido com o guardado e SHALL escrever apenas os registros que mudaram, criando os novos e apagando os que deixaram de existir no conteúdo recebido.

#### Scenario: Ficha sem mudanças
- **WHEN** a mesma ficha é gravada duas vezes seguidas
- **THEN** a segunda gravação não altera nenhum registro de Pokémon, item ou talento

#### Scenario: Um Pokémon alterado
- **WHEN** a ficha é gravada com o nível de um único Pokémon diferente
- **THEN** somente esse Pokémon (com seus golpes, habilidades e atributos) é regravado

#### Scenario: Pokémon removido
- **WHEN** a ficha é gravada sem um Pokémon que existia
- **THEN** o Pokémon e todos os registros ligados a ele deixam de existir, e ele sai da equipe

#### Scenario: Falha no meio da gravação
- **WHEN** uma parte do conteúdo é recusada (por exemplo, uma foto inválida)
- **THEN** nenhuma parte da ficha é alterada

### Requirement: Equipe e posições consistentes
Cada Pokémon SHALL ocupar uma caixa (1 a 99) e uma posição (0 a 29) dentro dela, e duas posições da mesma ficha MUST NOT ser iguais. A equipe SHALL ter no máximo 6 Pokémon, em posições de 0 a 5, e cada Pokémon aparece uma única vez nela. Ids da equipe que não correspondem a nenhum Pokémon da ficha SHALL ser descartados.

#### Scenario: Duas posições iguais
- **WHEN** a gravação traz dois Pokémon na mesma caixa e posição
- **THEN** a resposta é `400` e nada é gravado

#### Scenario: Equipe maior que seis
- **WHEN** a gravação traz uma equipe com sete Pokémon
- **THEN** a resposta é `400` e nada é gravado

#### Scenario: Equipe com id desconhecido
- **WHEN** a equipe enviada inclui um id que não existe entre os Pokémon da ficha
- **THEN** o id é ignorado e a equipe devolvida na leitura não o contém

### Requirement: Fotos de Pokémon viram arquivos
Quando um Pokémon chegar com a foto em base64 (`data:image/...`), o sistema SHALL validar a imagem pelo conteúdo (PNG, JPEG, WebP ou GIF, nunca SVG, até 5 MB), gravá-la em `public/uploads/<ficha>/` com nome derivado do conteúdo e guardar e devolver o caminho `/uploads/<ficha>/<arquivo>` no lugar do base64. A mesma imagem enviada de novo MUST NOT gerar outro arquivo. Uma foto inválida ou grande demais SHALL ser recusada com erro claro e sem gravar nada.

#### Scenario: Foto em base64
- **WHEN** um Pokémon chega com uma foto PNG válida em base64
- **THEN** a foto é gravada como arquivo e a leitura devolve o caminho `/uploads/<ficha>/<arquivo>.png`, sem base64

#### Scenario: Mesma foto no autosave seguinte
- **WHEN** a ficha é gravada de novo com a mesma foto em base64
- **THEN** nenhum arquivo novo é criado e o caminho devolvido é o mesmo

#### Scenario: Foto que não é imagem
- **WHEN** a foto em base64 contém HTML ou SVG com tipo declarado `image/png`
- **THEN** a resposta é `400` e a ficha não é alterada

#### Scenario: Foto grande demais
- **WHEN** a foto em base64 tem mais de 5 MB
- **THEN** a resposta é `413` e a ficha não é alterada

#### Scenario: Foto já como caminho
- **WHEN** o Pokémon traz `imageUrl` como `/uploads/<ficha>/<arquivo>.png`
- **THEN** o caminho é guardado sem alteração

### Requirement: Migração preguiçosa de fichas antigas
Uma ficha cujo `sheetData` ainda contenha `inventario`, `talentos`, `equipe` ou `pcBoxes` SHALL ser decomposta nas tabelas na primeira leitura, sem perder dados, e o `sheetData` guardado passa a ser o reduzido. A operação MUST ser idempotente: repeti-la não duplica registros.

#### Scenario: Ficha antiga lida pela primeira vez
- **WHEN** uma ficha antiga com dois Pokémon e três itens embutidos no `sheetData` é lida
- **THEN** a leitura devolve a ficha completa, e os Pokémon e itens passam a existir em suas tabelas

#### Scenario: Segunda leitura
- **WHEN** a mesma ficha é lida de novo
- **THEN** nenhum registro é criado nem duplicado

### Requirement: Integridade e limites
Apagar uma ficha SHALL apagar todos os registros ligados a ela. O `ref` de Pokémon, itens e golpes MUST ser único dentro da ficha (ou do Pokémon, no caso de golpes). Uma ficha MUST ter no máximo 3.000 Pokémon, 500 itens e 200 talentos, e um Pokémon no máximo 50 golpes, 10 habilidades, 3 tipos e 30 capacidades extras.

#### Scenario: Apagar a ficha
- **WHEN** uma ficha com Pokémon, itens e talentos é apagada
- **THEN** nenhum Pokémon, golpe, habilidade, item nem talento dela permanece

#### Scenario: Ref repetido
- **WHEN** a gravação traz dois itens com o mesmo `ref`
- **THEN** a resposta é `400` e nada é gravado

#### Scenario: Coleção acima do limite
- **WHEN** um Pokémon chega com 51 golpes
- **THEN** a resposta é `400` e nada é gravado
