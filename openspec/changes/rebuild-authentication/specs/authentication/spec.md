# Spec Delta

## Purpose
Define como um jogador ou o GM prova quem é, como as contas são criadas e protegidas, como a sessão começa e termina, e quais proteções existem contra uso indevido, para que a identidade do usuário seja confiável em um app exposto à internet.

## ADDED Requirements

### Requirement: Login por nome de treinador e senha
O sistema SHALL autenticar um usuário somente quando o nome de treinador e a senha informados corresponderem a uma conta existente. O nome de treinador MUST ser comparado sem diferenciar maiúsculas de minúsculas e sem espaços nas pontas. Um login bem-sucedido SHALL abrir uma sessão e levar o usuário ao app.

#### Scenario: Credenciais corretas
- **WHEN** o usuário envia o nome e a senha de uma conta existente
- **THEN** uma sessão é aberta com o identificador e o papel da conta
- **AND** o usuário é levado à tela principal

#### Scenario: Nome com caixa diferente
- **WHEN** a conta "Ash Ketchum" existe e o usuário envia "  ash ketchum " com a senha correta
- **THEN** o login é bem-sucedido

#### Scenario: Senha incorreta
- **WHEN** o usuário envia uma senha que não corresponde à conta
- **THEN** nenhuma sessão é aberta

### Requirement: Papel definido apenas pelo servidor
O papel do usuário (`GM` ou `PLAYER`) SHALL vir sempre do banco de dados. O sistema MUST NOT aceitar papel, e-mail ou qualquer outro atributo de conta vindo do formulário de login.

#### Scenario: Papel enviado pelo cliente
- **WHEN** uma requisição de login inclui um campo `role` com o valor `GM` para uma conta de papel `PLAYER`
- **THEN** a sessão aberta tem o papel `PLAYER`

#### Scenario: Nome inexistente não cria conta
- **WHEN** o usuário envia um nome que não corresponde a nenhuma conta
- **THEN** nenhuma conta é criada e nenhuma sessão é aberta

### Requirement: Falha de login sem revelar a causa
Quando o login falhar por nome inexistente, senha incorreta, conta sem senha definida ou bloqueio temporário, a resposta ao usuário SHALL ser a mesma mensagem genérica de credenciais inválidas, e o tempo de resposta MUST NOT permitir distinguir um nome existente de um inexistente de forma prática.

#### Scenario: Nome inexistente e senha errada
- **WHEN** um login falha por nome inexistente e outro falha por senha incorreta de uma conta existente
- **THEN** as duas respostas têm a mesma mensagem e o mesmo formato

### Requirement: Senhas protegidas
O sistema SHALL guardar senhas somente como hash com salt aleatório por conta. Senhas MUST NOT aparecer em texto, em registros de log, em respostas de API ou em mensagens de erro. Uma senha SHALL ter no mínimo 8 caracteres para ser aceita em qualquer criação ou troca.

#### Scenario: Armazenamento
- **WHEN** uma conta é criada com a senha "senha-secreta-1"
- **THEN** o valor guardado no banco não contém "senha-secreta-1"
- **AND** duas contas com a mesma senha têm valores guardados diferentes

#### Scenario: Senha curta
- **WHEN** uma senha com menos de 8 caracteres é informada na criação ou na troca de senha
- **THEN** a operação é recusada e a senha anterior permanece válida

#### Scenario: Senha fora dos logs
- **WHEN** um login falha ou é bem-sucedido
- **THEN** nenhum registro de log contém a senha informada

### Requirement: Bloqueio temporário após falhas seguidas
O sistema SHALL bloquear temporariamente novas tentativas de login para um nome de treinador depois de 5 falhas consecutivas dentro de 15 minutos. Durante o bloqueio, até a senha correta MUST ser recusada. O bloqueio SHALL expirar sozinho após 15 minutos e um login bem-sucedido SHALL zerar a contagem.

#### Scenario: Quinta falha seguida
- **WHEN** 5 tentativas seguidas com senha incorreta são feitas para o mesmo nome
- **THEN** a sexta tentativa é recusada mesmo com a senha correta

#### Scenario: Fim do bloqueio
- **WHEN** 15 minutos se passam após o bloqueio
- **THEN** a senha correta volta a ser aceita

#### Scenario: Sucesso zera a contagem
- **WHEN** um login correto ocorre depois de 4 falhas seguidas
- **THEN** o contador de falhas daquele nome volta a zero

### Requirement: Cadastro inicial do GM
Enquanto nenhuma conta tiver senha definida, o sistema SHALL oferecer a tela `/setup` para criar a conta do GM, e a conta criada MUST receber o papel `GM`. Se já existir uma conta sem senha com o mesmo nome de treinador, o sistema SHALL reaproveitá-la, definindo a senha e o papel `GM` e preservando suas fichas. Assim que existir uma conta com senha, `/setup` MUST deixar de funcionar e qualquer tentativa de cadastro por ela SHALL ser recusada.

#### Scenario: Banco sem contas com senha
- **WHEN** nenhuma conta tem senha e um nome e uma senha válida são enviados em `/setup`
- **THEN** uma conta com papel `GM` e essa senha passa a existir
- **AND** o usuário é levado ao login

#### Scenario: Conta antiga reaproveitada
- **WHEN** existe a conta sem senha "Carlos" com fichas e o `/setup` recebe o nome "carlos"
- **THEN** a conta existente ganha a senha e o papel `GM`, e suas fichas continuam ligadas a ela

#### Scenario: Cadastro inicial já feito
- **WHEN** existe pelo menos uma conta com senha e alguém acessa `/setup` ou envia o cadastro inicial
- **THEN** a tela redireciona para o login e o envio é recusado sem criar conta

### Requirement: Contas criadas e geridas apenas pelo GM
Depois do cadastro inicial, somente um usuário autenticado com papel `GM` SHALL poder criar contas de jogadores e redefinir senhas, definindo a senha inicial. O sistema MUST NOT oferecer nenhum cadastro público. O papel do solicitante SHALL ser conferido no banco a cada operação, não só na sessão.

#### Scenario: GM cria jogador
- **WHEN** o GM envia um nome livre e uma senha válida pelo painel de administração
- **THEN** uma conta com papel `PLAYER` é criada e o jogador consegue entrar com esses dados

#### Scenario: Nome já em uso
- **WHEN** o GM tenta criar uma conta com um nome que já existe (ignorando maiúsculas e espaços nas pontas)
- **THEN** a criação é recusada e a conta existente não muda

#### Scenario: Jogador tenta criar conta
- **WHEN** um usuário com papel `PLAYER` chama a operação de criar conta
- **THEN** a operação é recusada e nenhuma conta é criada

#### Scenario: Visitante tenta criar conta
- **WHEN** uma requisição sem sessão chama a operação de criar conta
- **THEN** a operação é recusada

#### Scenario: GM redefine senha
- **WHEN** o GM define uma nova senha válida para um jogador
- **THEN** a senha antiga deixa de funcionar e a nova funciona

### Requirement: Troca da própria senha
Um usuário autenticado SHALL poder trocar a própria senha informando a senha atual e uma nova senha válida. Se a senha atual estiver incorreta, a troca MUST ser recusada.

#### Scenario: Troca bem-sucedida
- **WHEN** o usuário informa a senha atual correta e uma nova senha válida
- **THEN** a senha antiga deixa de funcionar e a nova funciona

#### Scenario: Senha atual incorreta
- **WHEN** o usuário informa uma senha atual incorreta
- **THEN** a troca é recusada e a senha continua a mesma

### Requirement: Sessão segura e encerramento
A sessão SHALL ser mantida em cookie `httpOnly`, com duração máxima de 3 horas, e SHALL conter apenas o identificador e o papel do usuário. O usuário SHALL poder encerrar a sessão (logout). Páginas e operações restritas MUST recusar quem não tem sessão, redirecionando páginas para o login.

#### Scenario: Visitante na página principal
- **WHEN** uma requisição sem sessão acessa `/`
- **THEN** a resposta redireciona para `/login`
- **AND** se nenhuma conta tem senha, redireciona para `/setup`

#### Scenario: Logout
- **WHEN** o usuário encerra a sessão
- **THEN** o acesso a `/` volta a redirecionar para o login

### Requirement: Segredo de sessão obrigatório
O sistema MUST NOT usar um segredo de sessão padrão. Se a variável `AUTH_SECRET` não estiver definida, o sistema SHALL recusar-se a autenticar e registrar um erro claro, em qualquer ambiente.

#### Scenario: Variável ausente
- **WHEN** o servidor tenta autenticar sem `AUTH_SECRET` definida
- **THEN** o login falha, nenhuma sessão é aberta e um registro de log `error` informa que `AUTH_SECRET` é obrigatória
