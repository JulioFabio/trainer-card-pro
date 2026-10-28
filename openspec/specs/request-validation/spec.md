# request-validation Specification

## Purpose
Define a forma, os tipos, os limites e as mensagens de erro das entradas da API, para que dados malformados ou exagerados sejam recusados antes de chegar ao banco.

## Requirements

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
O sistema SHALL aplicar limites às entradas: nomes e títulos com no máximo 100 caracteres, descrições com no máximo 2.000, conteúdo de nota com no máximo 100.000, `level` entre 1 e 100, `money` entre 0 e 1.000.000.000, `quantity` entre 0 e 9.999, dados de trocas (`tradeData`) com no máximo 1 MB e o corpo de qualquer requisição com no máximo 10 MB. A ficha (`sheetData`) não tem mais um teto próprio: as fotos dos Pokémon deixam de ficar embutidas nela, e o que sobra é limitado pelo corpo.

#### Scenario: Ficha grande demais
- **WHEN** o corpo da requisição, com a ficha enviada, ultrapassa 10 MB
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

### Requirement: Esquema completo de Pokémon e de item
As rotas granulares SHALL validar o corpo de Pokémon e de item contra um esquema estrito e aninhado: espécie, apelido, nível, gênero (`M`, `F` ou `U`), bola, natureza, vida, evasões, deslocamentos, capacidades, tipos, habilidades, golpes (com categoria `Físico`, `Especial` ou `Status`) e atributos, todos com tipos e faixas definidos. Campos desconhecidos em qualquer nível MUST ser recusados com `400`, e a mensagem MUST citar o caminho do campo sem repetir o valor enviado.

#### Scenario: Golpe com categoria inválida
- **WHEN** um Pokémon é enviado com um golpe de categoria `Mágico`
- **THEN** a resposta é `400` citando o campo do golpe e nada é gravado

#### Scenario: Campo desconhecido aninhado
- **WHEN** um golpe dentro do Pokémon traz um campo que não faz parte do esquema
- **THEN** a resposta é `400`

#### Scenario: Pokémon completo válido
- **WHEN** um Pokémon com todos os campos dentro das faixas é enviado por quem pode alterar a ficha
- **THEN** a resposta é `201` e a leitura devolve o mesmo Pokémon

### Requirement: Limites das coleções e das posições
O sistema SHALL recusar com `400` Pokémon com mais de 50 golpes, 10 habilidades, 3 tipos ou 30 capacidades extras; caixa fora de 1 a 99; posição na caixa fora de 0 a 29; posição na equipe fora de 0 a 5; e `ref` vazio, com mais de 64 caracteres ou com caracteres fora de letras, números, hífen e sublinhado.

#### Scenario: Posição fora da faixa
- **WHEN** um Pokémon é enviado na caixa 100 ou na posição 30
- **THEN** a resposta é `400`

#### Scenario: Ref com caracteres inválidos
- **WHEN** um item é enviado com `ref` contendo `../` ou espaços
- **THEN** a resposta é `400`
