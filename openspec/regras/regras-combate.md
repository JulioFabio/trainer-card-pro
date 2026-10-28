# Regras de Combate

Fonte: Pokémon – RPG de Mesa, Livro do Jogador, p. 8, 11–19, 182, 195–198. Arredonde frações sempre para baixo.

## Rodada e Iniciativa
- Uma rodada = **6 segundos**.
- **Ordem:** primeiro **todos os humanos**, da maior Velocidade para a menor; depois **todos os pokémons**, também da maior para a menor.
- **Ações do humano por rodada:** Ação Padrão + Ação de Movimento + Ação de Comando (+ Ações Livres).
- **Ações do pokémon:** Ação de Movimento + Ação de Golpe (+ Ações Livres).

| Ação | O que faz |
|---|---|
| Padrão | Usar Talentos de Ação Padrão, ataque de Armas, usar item, lançar pokébola, trocar de arma. Enviar até 2 pokémons, recolher até 2, ou recolher 1 e enviar 1. Se o recolhido estiver abaixo de 1% dos PV, essa troca custa só Ação Livre. |
| Comando | Diz ao pokémon o que fazer (movimento, Golpe, Capacidade, Habilidade). Só é resolvida no turno do pokémon. |
| Movimento | Desloca-se usando um Deslocamento. O humano também pode enviar ou recolher 1 pokémon. |
| Golpe | Usar um Golpe (encerra o turno do pokémon). |

- **Pokémon recém-enviado** não ataca na mesma rodada (exemplo do livro).
- **Interceptar ataque ao dono:**
  - Requisitos: o pokémon ainda não se moveu e tem Deslocamento suficiente para chegar até o dono.
  - Custo: sacrifica a próxima Ação de Movimento e fica no lugar do dono.
  - Teste: 1d20 ≥ 11 (Velocidade até 20), ≥ 6 (Velocidade 21–35) ou ≥ 1 (Velocidade acima de 35).
  - Só vale para ataques contra o próprio humano.

## Teste de Acurácia
- **Acerta com `1d20 ≥ Dificuldade de Acurácia (AC) + Evasão do alvo`.** O Narrador soma a Evasão em segredo.
- Área com vários alvos: uma rolagem só; cada alvo compara com a própria Evasão.
- **20 natural:** sempre acerta e é **Crítico**. **1 natural:** Falha Crítica.
- **Acurácia Automática:** não rola, não erra e não pode ser Crítico.
- Golpes que não causam dano ignoram Evasão.
- Terreno Acidentado entre atacante e alvo: AC +2.

### Evasão
- **Física** = Defesa ÷ 5 (só contra ataques Físicos).
- **Especial** = Defesa Especial ÷ 5 (só contra Especiais).
- **Veloz** = Velocidade ÷ 5 (contra ambos).
  - Na descrição dos atributos do pokémon o livro diz Velocidade ÷ 10. Ver `regras-pokemon.md`.
- Aplica-se **só a maior** Evasão que vale para o ataque.
- Limites: no máximo **6** vindo de atributos; com bônus externos, no máximo **9**.
- Aumentos temporários de atributo (incluindo Fases) **não** mudam a Evasão. Efeitos que alteram "Evasão" diretamente afetam as três.

## Fases (−6 a +6)
| Fase | −6 | −5 | −4 | −3 | −2 | −1 | 0 | +1 | +2 | +3 | +4 | +5 | +6 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Atributo | 40% | 50% | 60% | 70% | 80% | 90% | 100% | 125% | 150% | 175% | 200% | 225% | 250% |
| Deslocamento (só Velocidade) | −2 | | | −1 | | | | | +1 | | +2 | | +3 |

- Fórmula: positivo = +25% por Fase; negativo = −10% por Fase.
- A linha de Deslocamento está como no livro: só −6, −3, +2, +4 e +6 têm valor, as outras Fases vêm em branco. O livro não diz se o bônus continua valendo nas Fases seguintes (por exemplo, +1 também na +3); **defina isso no app**. O Deslocamento mínimo é 1.
- **Duração:** somem no fim do combate ou quando o pokémon volta à pokébola. Fora de combate duram 10 minutos.
- Fases não alteram os Modificadores de humanos.

## Cálculo de dano (ordem)
1. Role o **Dano Basal** do Golpe.
2. \+ **Bônus Elemental**, se o Golpe for de um Tipo do usuário (Nível ÷ 5).
3. \+ **Ataque** (Físico) ou **Ataque Especial** (Especial).
4. Entrega o total ao alvo.
5. O alvo subtrai **Defesa** (Físico) ou **Defesa Especial** (Especial).
6. Aplica vulnerabilidades, resistências e imunidades (multiplicador).
7. Subtrai dos PV.

- **Crítico:** rola o Dano Basal duas vezes, dados e fixo. Exemplo: 3d12+10 vira 6d12+20.
- Dano descrito no Efeito (fora do Dano Basal) é **neutro**: sem atributos, sem Defesa, sem multiplicadores, mas imunidades ainda valem.
- Humanos não têm Tipo e normalmente recebem dano neutro.

### Efetividade
- Uma vulnerabilidade ×2; duas ×4.
- Uma resistência ×½; duas ×¼.
- Uma vulnerabilidade + uma resistência = neutro.
- **Imunidade ×0:** sem dano e sem os outros efeitos do Golpe, a menos que o alvo queira.

### Tabela de Tipos (atacante → defensor)
O livro usa a tabela oficial (Gen 6+). Os 18 Tipos: Água, Dragão, Elétrico, Fada, Fantasma, Fogo, Gelo, Inseto, Lutador, Metal, Normal, Pedra, Planta, Psíquico, Terra, Trevas, Venenoso, Voador.

| Golpe | ×2 contra | ×½ contra | ×0 contra |
|---|---|---|---|
| Normal | | Pedra, Metal | Fantasma |
| Fogo | Planta, Gelo, Inseto, Metal | Fogo, Água, Pedra, Dragão | |
| Água | Fogo, Terra, Pedra | Água, Planta, Dragão | |
| Elétrico | Água, Voador | Elétrico, Planta, Dragão | Terra |
| Planta | Água, Terra, Pedra | Fogo, Planta, Venenoso, Voador, Inseto, Dragão, Metal | |
| Gelo | Planta, Terra, Voador, Dragão | Fogo, Água, Gelo, Metal | |
| Lutador | Normal, Gelo, Pedra, Trevas, Metal | Venenoso, Voador, Psíquico, Inseto, Fada | Fantasma |
| Venenoso | Planta, Fada | Venenoso, Terra, Pedra, Fantasma | Metal |
| Terra | Fogo, Elétrico, Venenoso, Pedra, Metal | Planta, Inseto | Voador |
| Voador | Planta, Lutador, Inseto | Elétrico, Pedra, Metal | |
| Psíquico | Lutador, Venenoso | Psíquico, Metal | Trevas |
| Inseto | Planta, Psíquico, Trevas | Fogo, Lutador, Venenoso, Voador, Fantasma, Metal, Fada | |
| Pedra | Fogo, Gelo, Voador, Inseto | Lutador, Terra, Metal | |
| Fantasma | Psíquico, Fantasma | Trevas | Normal |
| Dragão | Dragão | Metal | Fada |
| Trevas | Psíquico, Fantasma | Lutador, Trevas, Fada | |
| Metal | Gelo, Pedra, Fada | Fogo, Água, Elétrico, Metal | |
| Fada | Lutador, Dragão, Trevas | Fogo, Venenoso, Metal | |

Com dois Tipos, multiplique os dois valores.

## Condições
Máximo de **2 Condições** ao mesmo tempo. Se uma 3ª for imposta, quem a causa escolhe qual substituir ou desiste. Crítico não conta nesse limite. Com mais de uma, o afetado escolhe a ordem em que elas ativam.

| Condição | Efeito | Cura |
|---|---|---|
| **Atordoamento** | Não faz nenhuma Ação por 1 rodada | Acaba sozinho depois de 1 rodada |
| **Confusão (humano)** | No início do turno, 1d20: abaixo de 11 não age | Repouso |
| **Confusão (pokémon)** | A cada Ação de Movimento ou de Golpe, 1d20. 1–10: sofre dano igual a 2× o próprio Bônus Elemental (sem atributos nem Tipos). 11–15: age normalmente. 16–20: curado. | Rolagem 16–20 |
| **Congelamento** | Não faz nenhuma Ação | 1×/rodada, 1d20 ≥ 16 (≥ 11 para pokémons de Fogo, Gelo ou Lutador). Também descongela se atingido por Golpe de dano de Fogo, Lutador, Metal ou Pedra. |
| **Crítico** | Dura uma rolagem de dano: o Dano Basal é dobrado | Após a rolagem |
| **Paixão** (só pokémons) | Antes de usar Golpe, 1d20. 1–10: não pode mirar o Golpe em quem ama (a menos que seja benéfico). 11–19: normal. 20: curado. | Rolagem 20 |
| **Paralisia** | Velocidade à metade. A cada rodada, 1d20 ≥ mínimo para agir (tabela abaixo); se falhar, não se move nem usa Ação Padrão ou de Golpe. Pokémons Elétrico e Dragão que tiram 20 podem gastar todas as ações da rodada para se curar. Enviado da pokébola Paralisado, começa na 6ª rodada da tabela. | 1 hora de descanso |
| **Queimadura** | −2 Fases de Defesa. No fim de cada rodada perde 1/10 dos PV máx (humano: 1/20). Não afeta quem está em repouso ou na pokébola. | 1×/turno, gastando Ação Padrão (humano) ou de Golpe (pokémon): 1d20 ≥ 17 (≥ 13 para pokémon de Fogo) |
| **Sono** | Não age. A cada rodada, 1d20 ≥ mínimo para acordar (tabela abaixo). Enviado da pokébola dormindo, começa na 3ª rodada. Sono do Golpe Descansar: dorme exatamente 2 rodadas, sem teste. | Rolagem |
| **Veneno** | −2 Fases de Defesa Especial. No fim de cada rodada perde 1/10 dos PV máx (humano: 1/20). **Veneno Mortal:** perda extra a cada rodada (tabela abaixo) e não pode ser curado por rolagem. Pokémons Metal e Venenoso são imunes. Não afeta na pokébola nem em repouso completo. | 1×/turno, gastando Ação Padrão ou de Golpe: 1d20 ≥ 17 |

| Rodada | 1ª | 2ª | 3ª | 4ª | 5ª | 6ª | 7ª | 8ª | 9ª | 10ª | 11ª+ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Paralisia: mínimo para agir | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
| Sono: mínimo para acordar | 16 | 14 | 12 | 10 | 8 | 6 | 6 | 6 | 6 | 6 | 6 |
| Veneno Mortal: PV extra perdidos | 5 | 10 | 20 | 40 | 80 | 160 | dobra a anterior | | | | |

## Terrenos
| Terreno | Deslocamento usado | Notas |
|---|---|---|
| Regular | Terrestre | Terra, grama curta, cimento, pisos |
| Gelado (subtipo de Regular) | Terrestre | Escorrega até o fim do gelo ou até bater num Bloqueador. Colisão com criatura: o primeiro para, o segundo continua o deslizamento. Teste de Parada: Ação Padrão ou de Golpe, 1d20 ≥ 14, para onde quiser. |
| Terroso | Escavação | Atravessar o solo sem túnel |
| Superfície | Natação | Água até a metade da altura (relativo ao tamanho da criatura) |
| Aquático | Subaquático | Totalmente submerso |
| Bloqueador | — | Intransponível; pode ser escalado. Raramente deixa Golpes passarem. Destruído, vira Acidentado. |
| Acidentado | Metade do Deslocamento normal | AC +2 se houver Acidentado entre atacante e alvo. Espaços ocupados por outros contam como Acidentado. |
| Arenoso | Metade (é Acidentado) | Areia fina de deserto. Regular para quem tem a Capacidade Escavação ou a Habilidade Manto de Areia. |

## Fuga
- **Teste de Fuga (humano, de encontro com selvagens):** precisa de um pokémon (seu ou de aliado) como cobertura e gasta todas as Ações. 1d20 ≥ 11.
  - Precisa de ≥ 16 se os selvagens forem mais que o dobro dos aliados, ou se todos tiverem Nível acima do dobro do Nível do pokémon de cobertura.
  - Sucesso: humano e pokémon vão para 15 m do encontro, ignorando Deslocamentos.
  - Se voltar ao encontro, novas fugas só dão certo com 20 natural.
- **Selvagens também fogem com o Teste de Fuga** e se afastam 20 m por rodada até serem capturados ou o humano desistir.
- Quem foge não ganha XP.

## Captura
- Lançar pokébola = **Ação Padrão**.
- **Teste de Captura:** 1d100 + Modificador da Pokébola (ver `itens.md`). **Captura se o resultado for menor que a Chance de Captura do alvo.**
- A Chance de Captura base e seus modificadores ficam no Livro do Narrador ou dos Pokémons. Pelo exemplo do livro:
  - Bidoof tem base 40, +25 com 1 PV, +20 com Nível abaixo de 21.
  - Bibarel tem base 20, +20 com Nível abaixo de 20, +5 abaixo de 50% dos PV.
- Pokébolas **não capturam alvos inconscientes**.
- Talentos de Captor modificam a rolagem (ex.: Ponto de Captura subtrai metade do MV).

## Golpes: campos
Formato: Nome · Tipo · Aptidão · Descritores · Dificuldade de Acurácia · Dano Basal · Alcance · Frequência · Descritor de Concurso · Efeito. Dados em `golpes.csv`.

| Alcance | Significado |
|---|---|
| Si | O próprio usuário. Uma Explosão parte do usuário. |
| Corpo a Corpo | Alvo adjacente (ou si mesmo) |
| À Distância N | Até N metros, mas **não** um alvo adjacente. Uma Explosão pode ter centro em qualquer ponto do alcance. |
| Área | Região que cobre pelo menos todo o campo de batalha |

| Frequência | Após o uso |
|---|---|
| À Vontade | Pode usar de novo na hora |
| Rodada Sim Rodada Não | Espera 1 rodada (6 s) |
| Por Encontro | Espera 5 minutos (resto do combate) |
| Diária | Só depois de 8 h de sono. Para pokémons, um Centro Pokémon substitui o descanso. |

- **Dano Basal** "Físico" usa Ataque e Defesa; "Especial" usa Ataque Especial e Defesa Especial. Sem dano = Status.
- O Efeito normalmente se aplica depois do dano.
- Se o Golpe afeta "item Mantido" de um humano, pode afetar qualquer item dele.

### Descritores de Golpe
| Descritor | Regra |
|---|---|
| Ameaça | Coloca um efeito numa parte do campo; usos seguintes podem piorar o terreno |
| Barreira N | Cria barreira de N m de comprimento, 2 m de altura e alguns cm de espessura. Contínua ou em partes a até 1 m uma da outra. Empilhável. Some no fim do encontro ou em 5 min. Cada Barreira diz se dá para atravessar ou mirar através dela. |
| Clima | Altera o clima de uma área |
| Cobertura | Camada sobre o alvo. Não acumula com outra Cobertura. Resistência dada por Cobertura = sofre metade do dano daquele Tipo. |
| Coluna N | Sempre À Distância: retângulo de largura N do usuário até um ponto no alcance |
| Dança | Exige dançar |
| Empurrão N (X) | Empurra N m para longe do usuário. Se colidir com Bloqueador ou criatura, ambos sofrem X. Dano de Empurrão e queda é sem Tipo e não usa Defesa. |
| Exaustão | Na rodada seguinte o usuário não age (ainda pode ser recolhido) |
| Explosão N | Todas as criaturas num círculo de raio N centrado no alvo |
| Impacto | Só se o usuário se moveu em direção ao alvo nesta rodada (pode se afastar e voltar no mesmo turno) |
| Interceptação | Usável durante a ação do oponente, na situação descrita. Usada fora do turno, perde a Ação de Golpe da rodada. |
| Interrupção | Como Interceptação, mas perde todas as Ações da rodada. Não pode ser usada contra Interceptação ou Interrupção (exceto Finta). |
| Investida | Linha reta de todo o Deslocamento, acertando todos no caminho; AC +2 por alvo além do primeiro. Não pode terminar em espaço ocupado. |
| Moral | O efeito de Moral vale mesmo se o Golpe errar |
| Preparo | Ao declarar, o turno acaba. O Golpe ocorre na rodada seguinte (gasta Ação de Golpe, ou Padrão se humano). Pode desistir. |
| Prisão | O alvo não foge, não volta à pokébola e não se desloca. Acaba se o criador sair, desmaiar ou for recolhido. |
| Rebote (fração) | O usuário sofre a fração do dano causado (sem contar Condições e Empurrão). Dano sem Tipo e sem Defesa. |
| Saraivada N | N ataques separados, cada um com seu Teste de Acurácia e sua rolagem de dano (com atributos e Defesa) |
| Som | Depende de produzir som |

### Capacidades e Deslocamentos concedidos por Golpes
| Golpe | Concede |
|---|---|
| Aromatizar | Sedução |
| Bomba Magnética, Campo Magnético, Magnetização | Magnetismo |
| Brasa, Espiral de Fogo, Explosão de Fogo, Lança-Chamas, Rajada de Chamas | Combustão |
| Brilho, Clarão | Luminar |
| Camuflagem | Camuflagem |
| Carga, Choque do Trovão, Descarga, Onda de Choques, Relâmpago | Eletricidade |
| Cauda de Vento, Ventania | Vento |
| Cavar | +3 no Deslocamento de Escavação |
| Chicote, Chicote de Vinha, Lançar Teia, Teia de Aranha, Teia Elétrica, Teia Pegajosa | Fiação |
| Crescimento, Estocagem | Tumefação |
| Dádiva da Natureza, Enraizar, Fotossíntese, Poder da Natureza, Poder Secreto | Rebento |
| Demolição, Detonação, Pedras Soltas, Tumba de Pedra | Materialização |
| Detecção, Esfera da Aura, Expansão da Aura, Onda de Vácuo, Pulso de Cura, Pulso do Dragão, Pulso Sombrio, Repuxo | Aura |
| Devorar Sonhos | Onirismo |
| Esporte Aquático, Hidrobomba, Jato d'Água, Pulso d'Água | Manancial |
| Farejar | Faro |
| Feitiço, Rancor | Bruxaria |
| Ira Terrestre, Magnitude, Terremoto | Térreo |
| Liofilização, Nevasca, Neve, Raio Aurora, Raio de Gelo, Zero Absoluto | Congelação |
| Mergulho | Perde Afundamento; +3 no Deslocamento Subaquático |
| Minimizar | Encolhimento |
| Paranormal, Telecinesia | Telecinesia |
| Previsão | Presciência |
| Pular | +1 na Capacidade Salto |
| Superforça | +1 na Capacidade Força |
| Surfe | Perde Afundamento; +4 no Deslocamento de Natação |
| Voar | +4 no Deslocamento de Voo |

## Exemplos de cálculo (do livro)
- **Chute de Guerreiro:** 1d10+4 + Ataque 13 + MA + MD (Foco Combativo) = 21. Menos a Defesa 5 do Bidoof = 16.
- **Investida de Bidoof** (AC 3) contra uma Turtwig com Evasão 2: precisa tirar 5+. Dano 2d8+6 + Ataque + Bônus Elemental = 16, menos Defesa 11 = 5.
- **Crítico de Investida:** 4d8+12 + Ataque + Bônus Elemental.
- **Jato d'Água** em Squirtle: 19 − DefEsp 9 = 10; resistente a Água → 5.
