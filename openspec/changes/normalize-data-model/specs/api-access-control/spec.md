# Spec Delta

## ADDED Requirements

### Requirement: Leitura de Pokémon e itens por ficha
As rotas de Pokémon e de itens SHALL oferecer leitura por ficha (`GET` com o identificador da ficha) e por registro (`GET` com o identificador do Pokémon ou do item), abertas a qualquer usuário com sessão válida. A leitura MUST devolver o modelo completo do registro, incluindo seus tipos, habilidades, golpes, capacidades e atributos no caso do Pokémon.

#### Scenario: Jogador lista os Pokémon de outro
- **WHEN** um jogador logado pede os Pokémon da ficha de outro jogador
- **THEN** a resposta é `200` com a lista completa, cada Pokémon com golpes, habilidades e atributos

#### Scenario: Leitura sem sessão
- **WHEN** a leitura de Pokémon ou de itens é pedida sem sessão
- **THEN** a resposta é `401`

#### Scenario: Pokémon inexistente
- **WHEN** a leitura aponta para um Pokémon ou item que não existe
- **THEN** a resposta é `404`

#### Scenario: Escrita continua restrita
- **WHEN** um jogador tenta criar, alterar ou apagar um Pokémon ou item de outra ficha pelas rotas granulares
- **THEN** a resposta é `403` e nada muda
