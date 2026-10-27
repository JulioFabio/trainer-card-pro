# Spec Delta

## Purpose
Define como cada pessoa entra na sessão de jogo (jogadores escolhendo um perfil, o Mestre pelo computador dele), como o Mestre gerencia perfis e senhas, e como a sessão é aberta e protegida, para uma mesa de confiança exposta por link.

## ADDED Requirements

### Requirement: Entrada por seleção de perfil
A tela de entrada SHALL mostrar o nome da sessão e uma lista com os nomes dos perfis de jogador cadastrados pelo Mestre. Escolher um perfil (e informar a senha, quando exigida) SHALL abrir uma sessão com o identificador e o papel `PLAYER` daquele perfil. O sistema MUST NOT impedir que um jogador escolha o perfil de outro jogador.

#### Scenario: Perfil sem senha
- **WHEN** o visitante escolhe na lista um perfil que não tem senha
- **THEN** uma sessão é aberta para esse perfil com o papel `PLAYER`

#### Scenario: Lista e nome da sessão
- **WHEN** um visitante abre a tela de entrada e existem os perfis "Túlio", "Robert" e "Black" na sessão "Mesa de Sexta"
- **THEN** a tela mostra "Mesa de Sexta" e uma lista com os três nomes

#### Scenario: Sem perfis
- **WHEN** nenhum perfil de jogador foi criado
- **THEN** a tela de entrada informa que o Mestre ainda não criou perfis e não abre nenhuma sessão

#### Scenario: Escolha do perfil de outro jogador
- **WHEN** um visitante escolhe o perfil "Robert" que não tem senha, sendo ele outro jogador
- **THEN** a sessão é aberta no perfil "Robert"

### Requirement: Senha opcional por perfil
Cada perfil SHALL poder ter uma senha definida pelo Mestre. Quando o perfil tem senha, a entrada SHALL exigir a senha correta; quando não tem, a entrada MUST NOT pedir nem validar senha. Senhas SHALL ter no mínimo 4 caracteres para serem aceitas.

#### Scenario: Perfil com senha e senha correta
- **WHEN** o visitante escolhe um perfil com senha e informa a senha correta
- **THEN** uma sessão é aberta para esse perfil

#### Scenario: Perfil com senha e senha incorreta
- **WHEN** o visitante escolhe um perfil com senha e informa uma senha incorreta ou nenhuma
- **THEN** nenhuma sessão é aberta e a tela informa que a senha está incorreta

#### Scenario: Senha curta
- **WHEN** o Mestre tenta definir uma senha com menos de 4 caracteres
- **THEN** a operação é recusada e a senha anterior do perfil, se houver, permanece

### Requirement: Papel definido apenas pelo servidor
O papel do usuário (`GM` ou `PLAYER`) SHALL vir sempre do banco de dados. Nenhum dado enviado pelo cliente na entrada (campo de papel, nome livre ou qualquer outro) MUST alterar o papel da sessão ou criar um perfil.

#### Scenario: Papel enviado pelo cliente
- **WHEN** uma requisição de entrada para um perfil `PLAYER` inclui um campo `role` com o valor `GM`
- **THEN** a sessão aberta tem o papel `PLAYER`

#### Scenario: Perfil inexistente
- **WHEN** uma requisição de entrada informa um identificador de perfil que não existe
- **THEN** nenhuma sessão é aberta e nenhum perfil é criado

### Requirement: Entrada automática do Mestre no computador local
O sistema SHALL abrir sessão com o papel `GM` sem senha quando a requisição vier do acesso local direto ao computador onde o app está instalado. Considera-se acesso local direto uma requisição cujo host é `localhost`, `127.0.0.1` ou `[::1]` e cuja origem declarada é a própria máquina. Como o servidor Next registra o endereço de origem em `x-forwarded-for` e o host em `x-forwarded-host` em toda requisição, esses dois cabeçalhos só são aceitos quando `x-forwarded-for` contém exclusivamente endereços de loopback e `x-forwarded-host` é igual ao host; qualquer outro valor desqualifica. A presença de `forwarded`, `x-real-ip`, `cf-connecting-ip` ou `via` também desqualifica. Requisições que não forem acesso local direto MUST NOT receber o papel `GM` por esse caminho.

#### Scenario: Mestre abre o app no próprio computador
- **WHEN** a requisição tem host `localhost:3000`, `x-forwarded-for` igual a `::1` e `x-forwarded-host` igual a `localhost:3000` (como o servidor os registra)
- **THEN** uma sessão com papel `GM` é aberta sem pedir senha

#### Scenario: Acesso pelo link do túnel
- **WHEN** a requisição chega com host do túnel e cabeçalho `x-forwarded-for`
- **THEN** nenhuma sessão `GM` é aberta e a tela de entrada de jogadores é mostrada

#### Scenario: Host falsificado atrás do túnel
- **WHEN** a requisição declara host `localhost` mas carrega `x-forwarded-for` com endereço externo, `x-forwarded-host` diferente do host, ou `cf-connecting-ip`
- **THEN** nenhuma sessão `GM` é aberta

#### Scenario: Acesso pela rede local
- **WHEN** a requisição tem host com o endereço de rede do computador (por exemplo `192.168.0.10:3000`)
- **THEN** nenhuma sessão `GM` é aberta

### Requirement: Senha do Mestre opcional para outros aparelhos
O Mestre SHALL poder definir uma senha do Mestre. Quando ela existir, o perfil "Mestre" SHALL aparecer na lista de entrada e abrir uma sessão `GM` quando a senha correta for informada. Quando não existir, o perfil Mestre MUST NOT aparecer na lista nem aceitar entrada por senha.

#### Scenario: Sem senha do Mestre
- **WHEN** o Mestre nunca definiu uma senha do Mestre
- **THEN** a lista de entrada não contém o perfil "Mestre"

#### Scenario: Entrada do Mestre por outro aparelho
- **WHEN** existe senha do Mestre e um visitante escolhe "Mestre" informando a senha correta
- **THEN** uma sessão com papel `GM` é aberta

#### Scenario: Senha do Mestre incorreta
- **WHEN** um visitante escolhe "Mestre" informando uma senha incorreta
- **THEN** nenhuma sessão é aberta

### Requirement: Recuperação da senha do Mestre por arquivo local
Ao iniciar, o sistema SHALL procurar o arquivo `RESET_SENHA_MESTRE` na pasta de dados do app. Se o arquivo existir, o sistema SHALL apagar a senha do Mestre, remover o arquivo e registrar o evento em log, sem registrar nenhuma senha. Sem o arquivo, nada muda.

#### Scenario: Arquivo de reset presente
- **WHEN** o app inicia e `RESET_SENHA_MESTRE` existe na pasta de dados
- **THEN** a senha do Mestre deixa de existir, o arquivo é removido e o perfil Mestre some da lista de entrada
- **AND** um registro de log informa que a senha do Mestre foi redefinida

#### Scenario: Arquivo ausente
- **WHEN** o app inicia sem o arquivo de reset
- **THEN** a senha do Mestre permanece como estava

### Requirement: Gestão de perfis, senhas e sessão pelo Mestre
Somente um usuário autenticado com papel `GM` SHALL poder criar, renomear e remover perfis de jogador, definir ou remover a senha de um perfil, definir ou remover a senha do Mestre e definir o nome da sessão. O papel do solicitante SHALL ser conferido no banco a cada operação. Nomes de perfil MUST ser únicos sem diferenciar maiúsculas de minúsculas e sem espaços nas pontas. Remover um perfil SHALL remover também as fichas dele.

#### Scenario: Mestre cria perfil
- **WHEN** o Mestre cria o perfil "Túlio"
- **THEN** "Túlio" passa a aparecer na lista de entrada

#### Scenario: Nome já em uso
- **WHEN** o Mestre tenta criar "túlio" existindo "Túlio"
- **THEN** a criação é recusada e o perfil existente não muda

#### Scenario: Jogador tenta gerir perfis
- **WHEN** um usuário com papel `PLAYER` chama qualquer operação de gestão
- **THEN** a operação é recusada e nada muda

#### Scenario: Visitante tenta gerir perfis
- **WHEN** uma requisição sem sessão chama qualquer operação de gestão
- **THEN** a operação é recusada

#### Scenario: Remoção de perfil
- **WHEN** o Mestre remove o perfil "Black" que tem uma ficha
- **THEN** o perfil e a ficha deixam de existir e "Black" some da lista de entrada

#### Scenario: Nome da sessão
- **WHEN** o Mestre define o nome da sessão como "Mesa de Sexta"
- **THEN** a tela de entrada passa a exibir "Mesa de Sexta"

### Requirement: Senhas protegidas
O sistema SHALL guardar senhas somente como hash com salt aleatório por senha. Senhas MUST NOT aparecer em texto, em registros de log, em respostas de API ou em mensagens de erro, e a lista pública de perfis MUST NOT incluir o hash nem informar quais perfis têm senha além do necessário para pedir a senha na tela.

#### Scenario: Armazenamento
- **WHEN** o Mestre define a senha "mesa123" para dois perfis
- **THEN** o valor guardado no banco não contém "mesa123"
- **AND** os dois valores guardados são diferentes

#### Scenario: Senha fora dos logs
- **WHEN** uma entrada com senha falha ou é bem-sucedida
- **THEN** nenhum registro de log contém a senha informada

### Requirement: Bloqueio temporário após falhas seguidas
O sistema SHALL bloquear temporariamente novas tentativas de senha para um perfil depois de 5 falhas consecutivas dentro de 15 minutos. Durante o bloqueio, até a senha correta MUST ser recusada. O bloqueio SHALL expirar sozinho após 15 minutos e uma entrada bem-sucedida SHALL zerar a contagem.

#### Scenario: Quinta falha seguida
- **WHEN** 5 tentativas seguidas com senha incorreta são feitas para o mesmo perfil
- **THEN** a sexta tentativa é recusada mesmo com a senha correta

#### Scenario: Fim do bloqueio
- **WHEN** 15 minutos se passam após o bloqueio
- **THEN** a senha correta volta a ser aceita

#### Scenario: Sucesso zera a contagem
- **WHEN** uma entrada correta ocorre depois de 4 falhas seguidas
- **THEN** o contador de falhas daquele perfil volta a zero

### Requirement: Sessão segura e encerramento
A sessão SHALL ser mantida em cookie `httpOnly`, com duração máxima de 3 horas, e SHALL conter apenas o identificador e o papel do usuário. O usuário SHALL poder encerrar a sessão (logout). Páginas e operações restritas MUST recusar quem não tem sessão, redirecionando as páginas para a tela de entrada.

#### Scenario: Visitante na página principal
- **WHEN** uma requisição sem sessão acessa `/`
- **THEN** a resposta redireciona para a tela de entrada

#### Scenario: Logout
- **WHEN** o usuário encerra a sessão
- **THEN** o acesso a `/` volta a redirecionar para a tela de entrada

### Requirement: Segredo de sessão por instalação
O sistema MUST NOT usar um segredo de sessão com valor fixo no código. Se a variável `AUTH_SECRET` estiver definida, o sistema SHALL usá-la. Caso contrário, o sistema SHALL gerar um segredo aleatório na primeira necessidade, guardá-lo em um arquivo local da pasta de dados e reutilizá-lo nas execuções seguintes.

#### Scenario: Variável definida
- **WHEN** `AUTH_SECRET` está definida
- **THEN** o sistema usa esse valor e não cria arquivo de segredo

#### Scenario: Primeira execução sem variável
- **WHEN** `AUTH_SECRET` não está definida e o arquivo de segredo não existe
- **THEN** um segredo aleatório é gerado e salvo no arquivo local

#### Scenario: Execuções seguintes
- **WHEN** o app reinicia sem `AUTH_SECRET` e o arquivo de segredo existe
- **THEN** o mesmo segredo é reutilizado, e as sessões abertas continuam válidas

#### Scenario: Instalações diferentes
- **WHEN** dois computadores geram o segredo pela primeira vez
- **THEN** os segredos gerados são diferentes
