# Spec Delta

## ADDED Requirements

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
