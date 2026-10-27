# Spec Delta

## Purpose
Define quem pode chamar cada rota de dados da API e o que cada tipo de usuário pode ler e alterar, para que a API fique fechada a quem não entrou na sessão e que ninguém altere por engano a ficha de outro jogador.

## ADDED Requirements

### Requirement: Sessão obrigatória nas rotas de dados
Toda rota de dados da API (fichas, Pokémon, itens, notas, trocas e upload) SHALL recusar com `401` a requisição que não tenha sessão válida. Somente `/api/health` e `/api/auth/*` MUST permanecer acessíveis sem sessão.

#### Scenario: Requisição sem sessão
- **WHEN** qualquer rota de dados recebe uma requisição sem sessão
- **THEN** a resposta é `401` e nenhum dado é lido nem alterado

#### Scenario: Rotas públicas
- **WHEN** `/api/health` recebe uma requisição sem sessão
- **THEN** a resposta é a de saúde do serviço, sem exigir login

### Requirement: Sessão conferida no banco
A sessão SHALL ser considerada válida somente se o perfil dela ainda existir no banco. O papel (`GM` ou `PLAYER`) usado nas decisões de acesso SHALL ser lido do banco a cada requisição, e não do conteúdo do token de sessão.

#### Scenario: Perfil removido
- **WHEN** o Mestre remove um perfil e a pessoa que estava logada nele faz uma requisição com o token antigo
- **THEN** a resposta é `401` e nenhum usuário nem ficha é recriado

#### Scenario: Papel alterado no banco
- **WHEN** o token de sessão diz `GM` mas o banco diz `PLAYER`
- **THEN** a requisição é tratada como de um jogador

### Requirement: Leitura aberta a quem está logado
Qualquer usuário com sessão válida SHALL poder ler qualquer ficha, com seus Pokémon, itens e notas, e a lista de trocas pendentes de qualquer ficha.

#### Scenario: Jogador lê a ficha de outro
- **WHEN** um jogador logado pede uma ficha que pertence a outro jogador
- **THEN** a resposta é `200` com a ficha completa

#### Scenario: Ficha inexistente
- **WHEN** um usuário logado pede uma ficha que não existe
- **THEN** a resposta é `404`

#### Scenario: Lista sem identificador
- **WHEN** um usuário logado pede a lista de fichas sem informar um identificador
- **THEN** a resposta contém apenas as fichas dele mesmo

### Requirement: Escrita só pelo dono da ficha ou pelo GM
Criar, alterar ou apagar uma ficha, ou qualquer dado ligado a ela (Pokémon, itens, notas e imagens), SHALL exigir que o usuário seja o dono da ficha ou o GM. Caso contrário a resposta MUST ser `403` e nada pode ser alterado.

#### Scenario: Dono altera a própria ficha
- **WHEN** o dono altera a própria ficha, ou cria um item, nota ou Pokémon nela
- **THEN** a operação é aceita

#### Scenario: GM altera a ficha de qualquer jogador
- **WHEN** o GM altera uma ficha que pertence a outro jogador
- **THEN** a operação é aceita

#### Scenario: Jogador altera a ficha de outro
- **WHEN** um jogador tenta alterar ou apagar a ficha de outro, ou um item, nota ou Pokémon dela
- **THEN** a resposta é `403` e o dado permanece igual

#### Scenario: Item, nota ou Pokémon de outra ficha por identificador
- **WHEN** um jogador envia o identificador de um item, nota ou Pokémon que pertence à ficha de outro jogador para alterar ou apagar
- **THEN** a resposta é `403`

#### Scenario: Registro inexistente
- **WHEN** a operação aponta para um item, nota, Pokémon ou ficha que não existe
- **THEN** a resposta é `404`

### Requirement: Mudança de dono de um Pokémon restrita
Alterar a ficha à qual um Pokémon pertence SHALL ser permitido apenas ao GM. Um jogador MUST NOT conseguir mover um Pokémon para outra ficha pela rota de edição de Pokémon.

#### Scenario: Jogador tenta mover um Pokémon
- **WHEN** um jogador envia uma edição de Pokémon que muda a ficha de destino
- **THEN** a resposta é `403` e o Pokémon continua na ficha original

### Requirement: Regras das trocas
Uma proposta de troca SHALL exigir que o usuário seja o dono da ficha remetente (ou o GM) e que as fichas remetente e destinatária existam e sejam diferentes. Aceitar ou recusar uma troca SHALL exigir que o usuário seja o dono da ficha destinatária (ou o GM), que a troca exista e que ela ainda esteja pendente, e o novo estado só pode ser `ACCEPTED` ou `REJECTED`.

#### Scenario: Proposta feita pelo dono do remetente
- **WHEN** o dono da ficha A propõe uma troca da ficha A para uma ficha B existente
- **THEN** a troca é criada com estado `PENDING`

#### Scenario: Proposta em nome de outro
- **WHEN** um jogador propõe uma troca com a ficha de outro jogador como remetente
- **THEN** a resposta é `403` e nenhuma troca é criada

#### Scenario: Destinatário inexistente ou igual ao remetente
- **WHEN** a proposta aponta para uma ficha destinatária que não existe, ou igual à remetente
- **THEN** a resposta é de erro e nenhuma troca é criada

#### Scenario: Destinatário responde
- **WHEN** o dono da ficha destinatária aceita ou recusa uma troca pendente
- **THEN** o estado da troca muda para `ACCEPTED` ou `REJECTED`

#### Scenario: Outro jogador tenta responder
- **WHEN** um jogador que não é dono da ficha destinatária (nem GM) tenta aceitar ou recusar
- **THEN** a resposta é `403` e a troca permanece pendente

#### Scenario: Troca já respondida
- **WHEN** alguém tenta responder uma troca que já foi aceita ou recusada
- **THEN** a resposta é de conflito e o estado não muda

#### Scenario: Estado inválido
- **WHEN** a resposta usa um estado diferente de `ACCEPTED` e `REJECTED`
- **THEN** a resposta é `400`

### Requirement: Cache da ficha coerente com as escritas
Depois de qualquer escrita em uma ficha ou em Pokémon, itens ou notas dela, a leitura seguinte da ficha SHALL refletir a escrita, sem devolver dados antigos do cache.

#### Scenario: Escrita em item invalida a leitura
- **WHEN** um item é criado em uma ficha logo depois de ela ter sido lida
- **THEN** a leitura seguinte da ficha já inclui o item novo

### Requirement: Registros de acesso sem dados de ficha
Quando uma requisição for recusada por falta de sessão ou de permissão, o registro de log SHALL conter o motivo e os identificadores envolvidos, e MUST NOT conter conteúdo de ficha, corpos de requisição nem senhas.

#### Scenario: Acesso negado
- **WHEN** um jogador tenta alterar a ficha de outro enviando dados na requisição
- **THEN** o log registra a recusa com os identificadores, sem nenhum valor enviado
