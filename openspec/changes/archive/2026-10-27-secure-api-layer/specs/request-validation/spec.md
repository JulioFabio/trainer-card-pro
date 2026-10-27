# Spec Delta

## Purpose
Define a forma, os tipos, os limites e as mensagens de erro das entradas da API, para que dados malformados ou exagerados sejam recusados antes de chegar ao banco.

## ADDED Requirements

### Requirement: Entradas validadas antes de qualquer efeito
Toda rota que recebe corpo, parâmetros de consulta ou formulário SHALL validar a entrada contra um esquema antes de ler o banco ou gravar. Entrada inválida SHALL resultar em `400`, sem nenhum efeito colateral.

#### Scenario: Corpo com tipo errado
- **WHEN** uma requisição envia um campo com o tipo errado, como `level` em texto ou `quantity` negativo
- **THEN** a resposta é `400` e nada é gravado

#### Scenario: Corpo que não é JSON
- **WHEN** uma rota recebe um corpo que não é um JSON válido
- **THEN** a resposta é `400`, e não um erro interno do servidor

#### Scenario: Campo obrigatório ausente
- **WHEN** falta um campo obrigatório, como o nome de um item
- **THEN** a resposta é `400` indicando o campo

### Requirement: Campos desconhecidos recusados
O corpo de uma requisição MUST NOT conter campos fora do esquema da rota. Campos desconhecidos SHALL resultar em `400`, de modo que nenhum campo interno (como `userId`, `id` ou o dono de uma ficha) possa ser definido por quem chama.

#### Scenario: Tentativa de definir o dono
- **WHEN** uma criação de ficha inclui `userId` de outro usuário no corpo
- **THEN** a resposta é `400` e a ficha não é criada

#### Scenario: Identificador definido pelo cliente
- **WHEN** uma criação de ficha inclui um `id` escolhido pelo cliente
- **THEN** a resposta é `400`, e os identificadores são sempre gerados pelo servidor

### Requirement: Limites de tamanho e de valores
O sistema SHALL aplicar limites às entradas: nomes e títulos com no máximo 100 caracteres, descrições com no máximo 2.000, conteúdo de nota com no máximo 100.000, `level` entre 1 e 100, `money` entre 0 e 1.000.000.000, `quantity` entre 0 e 9.999, a ficha (`sheetData`) com no máximo 8 MB depois de serializada (hoje as fotos dos Pokémon ficam embutidas nela) e os dados de Pokémon (`pokemonData`) e de trocas (`tradeData`) com no máximo 1 MB cada.

#### Scenario: Ficha grande demais
- **WHEN** o `sheetData` enviado ultrapassa 8 MB serializado
- **THEN** a resposta é `413` e a ficha anterior permanece

#### Scenario: Nível fora da faixa
- **WHEN** o `level` enviado é 0, 101 ou fracionário
- **THEN** a resposta é `400`

#### Scenario: Valores dentro dos limites
- **WHEN** todos os campos respeitam os limites
- **THEN** a requisição é aceita

### Requirement: Endereços de imagem restritos
Os campos de endereço de imagem (`avatarUrl` e `imageUrl`) SHALL aceitar apenas vazio, um caminho que começa por `/uploads/` ou um endereço `http` ou `https` de até 2.048 caracteres. Outros esquemas, como `javascript:` e `data:`, MUST ser recusados.

#### Scenario: Endereço com script
- **WHEN** `avatarUrl` é `javascript:alert(1)`
- **THEN** a resposta é `400`

#### Scenario: Caminho de upload
- **WHEN** `avatarUrl` é `/uploads/<ficha>/<arquivo>.png`
- **THEN** a requisição é aceita

### Requirement: Formato único de erro
Toda resposta de erro da API SHALL ter o formato `{ "error": "<mensagem em português>" }` e o código HTTP adequado (`400`, `401`, `403`, `404`, `409`, `413`). A mensagem MUST NOT incluir pilha de erro, caminhos de arquivos, consultas SQL nem os valores enviados.

#### Scenario: Erro de validação
- **WHEN** uma entrada é recusada por validação
- **THEN** o corpo tem a forma `{ "error": "..." }` com texto em português e sem os valores enviados

#### Scenario: Erro inesperado
- **WHEN** ocorre um erro interno inesperado
- **THEN** a resposta é `500` com mensagem genérica e o identificador da requisição, sem detalhes internos
