# Regras do Personagem (humano)

Fonte: Pokémon – RPG de Mesa, Livro do Jogador, p. 3–8 e 32–36. Arredonde sempre para baixo qualquer fração.

## Dados
- Usa-se d4, d6, d8, d10, d12, d20 e d100 (2d10).
- Em geral quer-se tirar **alto**. A exceção é o d100 (Teste de Captura), em que se quer tirar **baixo**.

## Atributos
Seis atributos: **Saúde, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade**.

| Atributo | Fora de combate | Em combate |
|---|---|---|
| Saúde | Resistência vital | Define os PV máximos. Não tem Modificador. |
| Ataque | Força física | Somado ao dano de ataques Físicos |
| Defesa | Vigor, constituição | Subtraída do dano Físico recebido |
| Ataque Especial | Inteligência, razão | Somado ao dano de ataques Especiais |
| Defesa Especial | Percepção, carisma, empatia | Subtraída do dano Especial recebido |
| Velocidade | Reflexos, precisão | Ordem de ação (Iniciativa) e Evasão |

### Criação (Nível 0)
- O personagem começa no **Nível 0, sem Classe**.
- Distribua **66 pontos** entre os 6 atributos, cada um entre **6 e 14**.
- Começa com as 2 Características Gerais: **Armas** e **Pokéagenda** (ver `talentos.csv`).

### Modificadores
| Atributo | Modificador |
|---|---|
| até 9 | atributo − 10 (1 → −9 … 9 → −1) |
| 10–11 | 0 |
| 12+ | +1 a cada 2 pontos acima de 10: 12–13 = +1, 14–15 = +2, 16–17 = +3, 18–19 = +4… |

Fórmula: `mod = atributo <= 9 ? atributo - 10 : floor((atributo - 10) / 2)`.
Siglas: MA (Ataque), MD (Defesa), MAE (Ataque Especial), MDE (Defesa Especial), MV (Velocidade). **Fases não alteram os Modificadores de humanos.**

## Pontos de Vida
- **Humano:** `PV máx = (Nível + Saúde) × 4`.
- Com 0 PV fica inconsciente. PV negativos podem levar à morte.
- Descanso de 8 horas cura 10% dos PV máximos (ver a Perícia Regeneração).

## Perícias
- Classe Básica dá **3 Perícias** de uma lista de 8. Classe Avançada dá **1** de uma lista de 2 (não vale se a Classe veio por Multiclasse).
- Teste: `1d20` sem a Perícia; `1d20 + 2 + Mod` com ela; `1d20 + 4 + 2×Mod` com ela duas vezes (o máximo).
- Resultado abaixo de 5 é falha completa. Pessoas comuns tiram de 5 a 14. Acima de 14 é treino ou sorte.
- Perícias de Saúde são passivas, sem rolagem. Repetidas não têm efeito.

| Atributo | Perícias |
|---|---|
| Saúde (passivas) | Apneia, Imunidade, Jejum, Resiliência |
| Ataque (MA) | Corrida, Força, Intimidação, Salto |
| Defesa (MD) | Concentração, Deflexão, Incansável, Regeneração |
| Ataque Especial (MAE) | Engenharia, História, Investigação, Programação |
| Defesa Especial (MDE) | Empatia, Manha, Manipulação, Percepção |
| Velocidade (MV) | Acrobacia, Furtividade, Performance, Prestidigitação |

### Perícias de Saúde
- **Apneia:** prende a respiração por até 5 minutos.
- **Imunidade:** sofre 3/4 do dano de Queimadura e Veneno. +2 nos testes contra Confusão, Congelamento, Paralisia e Sono.
- **Jejum:** aguenta 1 semana sem água e 1 mês sem comida (normal: 4 dias e 2 semanas).
- **Resiliência:** não perde PV por horas de esforço físico (correr, nadar, trabalhar).

### Tabelas de resultado
| Resultado | Corrida (deslocamento) | Força (empurrar/levantar) | Salto |
|---|---|---|---|
| 1 | Tropeça e cai | Derruba o objeto e fica Atordoado | Tropeça e cai |
| 5 | Cãibra: −1 no Deslocamento | Força normal (metade do próprio peso) | 60 cm de altura / 1,5 m de distância |
| 10 | Deslocamento normal | O próprio peso | 1,2 m / 3 m |
| 15 | +2 no Deslocamento | Peso ×2 | 1,5 m / 3,6 m |
| 20 | +4 no Deslocamento | Peso ×3 | 2,4 m / 6 m |
| 30 | Deslocamento ×4 (só Terrestre) | Peso ×4 | 3 m / 9 m |

| Resultado | Concentração | Incansável (após 24 h sem dormir; repetir a cada 2 h) | Regeneração (ao acordar) |
|---|---|---|---|
| 1 | Qualquer estímulo quebra o foco | Adormece por 1d4 horas | Nenhuma cura |
| 5 | Aguenta até 10 de dano | Perde 25% dos PV máx | Cura 10% (normal) |
| 10 | Até 20 de dano | Perde 15% | Cura 15% |
| 15 | Até 50 de dano | Perde 5% | Cura 25% |
| 20 | Até 150 de dano | Não perde PV | Cura 50% |
| 30 | Nenhum dano quebra o foco | Não perde PV e pula o próximo teste | Cura tudo e remove aflições |

| Resultado | Engenharia | História | Manha | Acrobacia | Performance |
|---|---|---|---|---|---|
| 1 | O objeto é estranho | Não sabe nada | Não sabe nada | Cai | Medo do palco |
| 5 | Supõe o propósito | Já ouviu falar | Conhece os principais empresários locais | Caminha em superfície larga, sobe escada comum | Erros não percebidos |
| 10 | Sabe ligar e desligar | Lugares: famosos, marcos, Ginásios | Sabe onde é perigoso e onde há serviços questionáveis | Equilibra-se em saliência ou tronco; escala 3 m | Salva de palmas |
| 15 | Opera e repara | Lugares: especificidades. Eventos: o essencial | Conhece os grupos que agem na cidade | Caminhos estreitos com rapidez; escala um prédio | Aplaudido de pé (até 100 créditos/dia) |
| 20 | Usa mesmo com defeito | Eventos: detalhes e contexto | Conhece os líderes desses grupos | Sem problemas para escalar ou se equilibrar | Ovação (até 1000 créditos/dia), fama local |
| 30 | Pode replicar o aparelho | Parece que esteve lá | Passa-se por membro de qualquer grupo | — | Inspira movimentos sociais |

- **Rolados contra NPC** (o jogador não sabe a dificuldade): Intimidação, Deflexão, Empatia (só pokémons instintivos, não os de Inteligência alta), Manipulação, Furtividade, Prestidigitação.
- **Contra cenário do Narrador:** Investigação, Percepção (ou contra Furtividade), Programação.
- **Deflexão:** intercepta objetos atirados, inclusive ataques de Armas, mas não Golpes que não gerem objeto físico.

## Deslocamentos (humano)
- **Terrestre:** 3 + metade do MA ou do MV (mínimo 5).
- **Natação:** 2 + metade do MD (mínimo 4).
- **Subaquático:** 3, ou 4 se MA ou MD for pelo menos 3.

## Evasão
Ver `regras-combate.md`. Vale para humanos e pokémons: Física = Def/5, Especial = DefEsp/5, Veloz = Vel/5. Máximo 6 vindo de atributos e 9 no total.

## Nível de Personagem
Humanos não ganham XP. Sobem **1 Nível** a cada marco:
- Adquirir o primeiro pokémon.
- Ganhar uma Insígnia de Ginásio.
- Ganhar um Prêmio em Concurso.
- Derrotar um membro da Elite dos Quatro (ou alguém igualmente capaz).
- A cada **10 espécies possuídas**. Cada estágio evolutivo conta como espécie separada; um pokémon recebido em troca substitui o que foi trocado, a menos que você tenha outro exemplar.
- A cada **40 pokémons identificados** com a Pokéagenda.
- Algo que o Narrador julgue digno de nota.

**Nível máximo: 50.** Ao subir, distribua o Ponto de Atributo antes de escolher o Talento.

| Nível | Classes | Ponto de Atributo | Talento | Total de Atributos* | Total de Talentos (inclui as 2 Características Gerais) |
|---|---|---|---|---|---|
| 0 | | 0 | 0 | 66 | 2 |
| 1 | Primeira | +1 | +1 | 67 | 3 |
| 2 | | +1 | +1 | 68 | 4 |
| 3 | | +1 | +1 | 69 | 5 |
| 4 | | +1 | +1 | 70 | 6 |
| 5 | Segunda | +1 | +1 | 71 | 7 |
| 6 | | +1 | +1 | 72 | 8 |
| 7 | | 0 | +1 | 73 | 9 |
| 8 | | +1 | +1 | 74 | 10 |
| 9 | | 0 | +1 | 75 | 11 |
| 10 | | +2 | +1 | 76 | 12 |
| 11 | | 0 | +1 | 77 | 13 |
| 12 | Terceira | +1 | 0 | 77 | 13 |
| 13 | | 0 | +1 | 78 | 14 |
| 14 | | +2 | 0 | 78 | 14 |
| 15 | | 0 | +1 | 79 | 15 |
| 16 | | +1 | 0 | 79 | 15 |
| 17 | | 0 | +1 | 80 | 16 |
| 18 | | +2 | 0 | 80 | 16 |
| 19 | | 0 | +1 | 81 | 17 |
| 20 | | +1 | 0 | 81 | 17 |
| 21 | | 0 | +1 | 82 | 18 |
| 22 | | +2 | 0 | 82 | 18 |
| 23 | | 0 | +1 | 83 | 19 |
| 24 | Quarta | +1 | 0 | 83 | 19 |
| 25–50 | | segue o padrão: pares alternam +2 (múltiplos de 4 + 2) e +1 (múltiplos de 4); ímpares 0 · Nível 50 = +3 | ímpares +1, pares 0 | 96 no Nível 50 | 32 no Nível 50 |

\* **Inconsistência do livro:** a coluna "Total de Atributos" não bate com a soma da coluna "Ponto de Atributo" (no Nível 10, por exemplo, o ponto é +2, mas o total sobe só 1). O total do livro acompanha a coluna Talento. **Defina qual das duas o app usa.** Somando a coluna "Ponto de Atributo", o Nível 50 dá 66 + 40 = 106.

### Classes
- **Limite de Classes:** 1 no Nível 1; 2 no Nível 5 (até 1 Avançada); 3 no Nível 12 (até 1 Avançada); 4 no Nível 24 (até 2 Avançadas).
- Entrar numa Classe **gasta o Talento do Nível**. Você ganha as 2 Características de Classe; os Talentos da Classe são escolhidos depois, com os Talentos de Nível.
- **Multiclasse:** pegar uma Classe Avançada sem a Básica. Os requisitos são maiores, não ganha a Perícia e ocupa um espaço de Classe.
- 9 Classes Básicas × 7 Avançadas = 72 Classes. Lista completa em `classes.csv` e todos os Talentos em `talentos.csv`.

| Básica | Avançadas |
|---|---|
| Artista | Beldade, Cativante, Coreógrafo, Descolado, Estilista, Nerd, Parrudo |
| Captor | Artífice, Colecionador, Domador, Engenheiro, Ladrão, Malabarista, Pokébolista |
| Criador | Botânico, Cozinheiro, Cuidador, Evolucionista, Incubador, Médico, Tutor |
| Guerreiro | Artista Marcial, Atleta, Áugure, Bandido, Monge, Ninja, Soldado |
| Místico | Bardo, Guardião, Ilusionista, Médium, Orador, Rúnico, Xamã |
| Pesquisador | Cientista, Fotógrafo, Hipnólogo, Observador, Ocultista, Petrologista, Professor |
| Psíquico | Ardente, Bruxo, Célio, Empático, Nebuloso, Terrulento, Vidente |
| Ranger | Aventureiro, Cavaleiro, Detetive, Guia, Oficial, Pactuário, Policial |
| Treinador | Azarão, Caçador, Elementalista, Especialista, Estrategista, Inquebrável, Síncrono |

## Talentos: formato
Campos: Categoria, Requisitos, Frequência, Alvo ou Gatilho, Efeito.
- **Frequência:** Contínua/Constante (sempre ativa), À Vontade, Horária, Diária, Semanal, Uso Único… Custos (como gastar PV) ficam na Frequência. "A cada X Níveis, receba um uso adicional" é o incremento.
- Cada Talento só pode ser ativado uma vez por Gatilho.
- **Ícones de ação** (coluna `ação` em `talentos.csv`):
  - Contínuo: não precisa ativar.
  - Padrão: gasta a Ação Padrão.
  - Livre: junto da Ação Padrão, sem gastá-la.
  - Interrupção: fora do seu turno.
  - Interrupção + Padrão: fora do turno, consumindo a próxima Ação Padrão.
  - Estendida: leva mais de 6 segundos.
- **Legalidade:** Legal pode ser usado em batalha oficial (Ginásio, Torneio). Ilegal desqualifica, mas pode ser usado como preparação antes do combate.

## Armas (Característica Geral)
- Ataque de Armas: Golpe **Físico, Tipo Normal**, Ação Padrão, **Dificuldade de Acurácia 6**. Desarmado conta como arma.
- **Dano** = Dano Basal + atributo Ataque + o maior entre MA e MV.
- **Alcances:** Corpo a Corpo 1 m. Curto Alcance (inclui arremesso) até 5 m, com −1 de dano a menos de 1 m. Longo Alcance de 4 a 10 m.

| Categoria de Dano Basal | Dano | Armas (padrão) | Arma de Escolha (AC 4) |
|---|---|---|---|
| 1 | 1d10+4 | Nível 1–6 | |
| 2 | 1d12+6 | Nível 7–14 | Nível 1–6 |
| 3 | 2d8+6 | Nível 15+ | |
| 4 | 2d10+8 | (Talentos) | Nível 7–14 |
| 5 | 3d8+10 | (Talentos) | |
| 6 | 3d10+12 | (Talentos) | Nível 15+ |
| 7 | 3d12+14 | (Talentos) | (Talentos) |
| 8 | 4d12+16 | (Talentos) | (Talentos) |

## Pokéagenda (Característica Geral)
- À Vontade, num pokémon não identificado a até 10 m. Leva **2 rodadas** (12 s) para identificar.
- Só depois de identificar o pokémon o jogador pode consultar os dados dele no Livro dos Pokémons. A Pokéagenda raramente tem dados de Lendários.
- É o documento oficial de identidade, emitido a partir dos 10 anos.

## Itens gerais e alimentação
Ver `itens.md`. Com menos de 2 refeições por dia, o personagem fica fatigado e as rolagens podem ser penalizadas.
