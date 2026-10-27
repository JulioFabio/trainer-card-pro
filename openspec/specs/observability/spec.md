# observability Specification

## Purpose
Define o que o servidor registra em log, em quais níveis e com quais restrições de privacidade. Também define como o health check reporta a saúde dos serviços, para que problemas possam ser diagnosticados sem custo excessivo de desempenho.

## Requirements

### Requirement: Nível de log configurável
O servidor SHALL emitir apenas registros com nível igual ou superior ao configurado na variável de ambiente `LOG_LEVEL` (`debug`, `info`, `warn`, `error`). Na ausência da variável, o nível padrão SHALL ser `info`.

#### Scenario: Nível padrão
- **WHEN** o servidor roda sem `LOG_LEVEL` definido
- **THEN** registros `info`, `warn` e `error` são emitidos e registros `debug` não são

#### Scenario: Nível restrito
- **WHEN** `LOG_LEVEL=warn`
- **THEN** apenas registros `warn` e `error` são emitidos

### Requirement: Logs em formato estruturado
Cada registro de log SHALL ser uma linha JSON contendo `timestamp`, `level`, `message` e, quando houver uma requisição em andamento, o `requestId` dessa requisição.

#### Scenario: Registro dentro de uma requisição
- **WHEN** um registro é emitido durante o processamento de uma requisição de API
- **THEN** a linha JSON contém o mesmo `requestId` retornado no cabeçalho `X-Request-ID` da resposta

### Requirement: Dados de ficha nunca aparecem nos logs
Os registros de log MUST NOT conter conteúdo de ficha de personagem, dados de Pokémon, notas, parâmetros de queries ao banco ou corpos de requisição, em qualquer nível de log.

#### Scenario: Salvamento de ficha
- **WHEN** uma ficha é salva via API com `LOG_LEVEL=debug`
- **THEN** nenhum registro emitido contém valores de campos da ficha

### Requirement: Queries lentas registradas
O servidor SHALL registrar com nível `warn` as queries ao banco cuja duração exceda o limiar configurado (padrão 100 ms), incluindo a duração e o texto da query sem parâmetros. Queries abaixo do limiar SHALL NOT gerar registros nos níveis `info` ou superiores.

#### Scenario: Query rápida
- **WHEN** uma query termina em menos de 100 ms
- **THEN** nenhum registro `info`, `warn` ou `error` é emitido para ela

#### Scenario: Query lenta
- **WHEN** uma query leva mais de 100 ms
- **THEN** um registro `warn` é emitido com a duração e o texto da query, sem os valores dos parâmetros

### Requirement: Eventos de cache em nível debug
Os eventos do cache em memória (acerto, falha, gravação, remoção) SHALL ser registrados apenas no nível `debug`.

#### Scenario: Leitura do cache com nível padrão
- **WHEN** uma rota lê do cache com `LOG_LEVEL=info`
- **THEN** nenhum registro de cache é emitido

### Requirement: Health check reporta falhas sem expor detalhes
`GET /api/health` SHALL responder `200` com status `UP` quando o banco responde, e `503` com status `DOWN` quando não responde. Quando o banco falhar, o servidor SHALL registrar um log `error` com a causa da falha, e a resposta MUST NOT incluir mensagem de erro, stack trace ou caminho de arquivo.

#### Scenario: Banco disponível
- **WHEN** `GET /api/health` é chamado e o banco responde
- **THEN** a resposta é `200` com `status: "UP"` e `services.database.status: "healthy"`

#### Scenario: Banco indisponível
- **WHEN** `GET /api/health` é chamado e a conexão com o banco falha
- **THEN** a resposta é `503` com `status: "DOWN"` e sem detalhes do erro
- **AND** um registro `error` com a mensagem da falha é emitido com o `requestId` da requisição
