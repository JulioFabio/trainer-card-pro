# Regras dos Pokémons

Fonte: Pokémon – RPG de Mesa, Livro do Jogador, p. 8–11, 19–20 e 182, 195–198. Os dados de cada espécie (atributos base, golpes por nível, capacidades) estão em `especies.csv`, e as definições de Capacidades em `capacidades.md`, ambos extraídos do **Livro dos Pokémons**.

## Atributos e PV
- **PV máx = Nível + 3 × Saúde.**
- Ataque / Ataque Especial são somados ao dano Físico / Especial. Defesa / Defesa Especial são subtraídas do dano recebido.
- Evasão: 1 a cada 5 de Defesa (contra Físico), 1 a cada 5 de Defesa Especial (contra Especial), 1 a cada 10 de Velocidade (contra qualquer ataque).
  - **Inconsistência do livro:** o texto geral de Evasão (p. 8) diz Velocidade/5, e a descrição do atributo Velocidade do pokémon (p. 9) diz /10. Defina qual o app usa (o exemplo do livro não esclarece).
- Na ficha ficam três colunas: **Atributo Basal**, **pontos de Nível** e **Total** (Basal + Nível).

## Relação Basal
- A Relação Basal é a ordem dos Atributos Basais, do maior ao menor; empates ficam no mesmo patamar.
- A cada Nível o pokémon ganha **1 ponto de Atributo**, que deve ser colocado sem quebrar essa ordem: um atributo nunca pode ultrapassar outro que tinha Basal maior.
- Exemplo do Charmander (Saúde 4, Atq 5, Def 4, AtqEsp 6, DefEsp 5, Vel 7): a ordem é Vel > AtqEsp > Atq = DefEsp > Saúde = Def, e o ponto do Nível 2 só pode ir em Velocidade.
- **Evolução:** os Atributos Basais mudam e todos os pontos de Nível são redistribuídos segundo a nova Relação Basal.
- **Megaevolução:** muda os Basais temporariamente, sem redistribuir pontos.
- **Suplementos** (Proteína, Ferro etc.) alteram os Basais, no máximo 5 na vida, e podem mudar a Relação Basal. Os pontos futuros seguem a nova ordem.

## Natureza
- +2 num Basal e −2 em outro; Saúde só ±1. Mínimo 1. Também define os sabores de que o pokémon gosta e não gosta. Tabela em `naturezas.md`.
- **Ordem ao gerar um pokémon:** Basais da espécie → aplicar a Natureza → definir o Nível → distribuir os pontos de Nível.

## Experiência e Nível
Ganha XP em batalhas, interpretação (criação) e Concursos. Nível máximo 100.

| Nível | XP | Nível | XP | Nível | XP | Nível | XP | Nível | XP |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 21 | 11500 | 41 | 55000 | 61 | 210000 | 81 | 410000 |
| 2 | 25 | 22 | 13000 | 42 | 60000 | 62 | 220000 | 82 | 420000 |
| 3 | 50 | 23 | 14500 | 43 | 65000 | 63 | 230000 | 83 | 430000 |
| 4 | 100 | 24 | 16000 | 44 | 70000 | 64 | 240000 | 84 | 440000 |
| 5 | 150 | 25 | 17500 | 45 | 75000 | 65 | 250000 | 85 | 450000 |
| 6 | 200 | 26 | 19000 | 46 | 80000 | 66 | 260000 | 86 | 460000 |
| 7 | 400 | 27 | 20500 | 47 | 85000 | 67 | 270000 | 87 | 470000 |
| 8 | 600 | 28 | 22000 | 48 | 90000 | 68 | 280000 | 88 | 480000 |
| 9 | 800 | 29 | 23500 | 49 | 95000 | 69 | 290000 | 89 | 490000 |
| 10 | 1000 | 30 | 25000 | 50 | 100000 | 70 | 300000 | 90 | 500000 |
| 11 | 1500 | 31 | 27500 | 51 | 110000 | 71 | 310000 | 91 | 510000 |
| 12 | 2000 | 32 | 30000 | 52 | 120000 | 72 | 320000 | 92 | 520000 |
| 13 | 3000 | 33 | 32500 | 53 | 130000 | 73 | 330000 | 93 | 530000 |
| 14 | 4000 | 34 | 35000 | 54 | 140000 | 74 | 340000 | 94 | 540000 |
| 15 | 5000 | 35 | 37500 | 55 | 150000 | 75 | 350000 | 95 | 550000 |
| 16 | 6000 | 36 | 40000 | 56 | 160000 | 76 | 360000 | 96 | 560000 |
| 17 | 7000 | 37 | 42500 | 57 | 170000 | 77 | 370000 | 97 | 570000 |
| 18 | 8000 | 38 | 45000 | 58 | 180000 | 78 | 380000 | 98 | 580000 |
| 19 | 9000 | 39 | 47500 | 59 | 190000 | 79 | 390000 | 99 | 590000 |
| 20 | 10000 | 40 | 50000 | 60 | 200000 | 80 | 400000 | 100 | 600000 |

- **XP de encontros:** cada pokémon derrotado ou capturado dá um valor por espécie (no Livro dos Pokémons, ex.: Bidoof = 10 × Nível, Bibarel = 30 × Nível).
- O total é dividido igualmente entre os pokémons que participaram. Quem foge não ganha XP.
- Bônus de classe: Treinador +20%; Artista +20% em Concursos.

## Bônus Elemental (STAB)
- **Bônus Elemental = Nível ÷ 5** (para baixo), somado ao dano de Golpes do mesmo Tipo do pokémon. Basta coincidir com um dos dois Tipos.
- Humanos não têm Bônus Elemental.

## Lealdade (0–4)
- Controlada pelo Narrador, que dá pistas em vez de revelar o número. Define o quanto o pokémon obedece, desafia o dono e é vulnerável a roubo.
- **3** é o ideal para a maioria. **4** fica para o inicial bem tratado ou companheiros de muitos anos.
- **Valores iniciais:** capturado ≈ 1 (0 se a captura foi cruel; mais alto se amigável); nascido de ovo = 2 (menos se o nascimento foi traumático); Pokébola Amigável = 2.
- Gratidão só funciona com Lealdade 3–4; Frustração só com 0–1. Itens **Repulsivos** reduzem a Lealdade se usados repetidamente.

## Evolução e Megaevolução
- **Formas de evoluir:** Nível, emoção ou Lealdade, Pedras Elementais, objetos ou troca.
- **Megaevolução:**
  - Requisitos: pokémon no último estágio, segurando a Megapedra da espécie; o humano tem uma Pedra-Chave e o Talento **Mega!** (todos os atributos 10).
  - Ativar a Pedra-Chave é uma **Ação Padrão** do humano. A transformação não gasta ações do pokémon.
  - Dura **10 minutos** ou até 0 PV.
  - Muda os Basais (sem redistribuir pontos), dá 1 Habilidade (dentro do limite de 2) e pode mudar os Tipos.

## Habilidades
- **1ª Habilidade** no Nível 1 (não pode ser uma Alta Habilidade). **2ª** a partir do Nível 40, entre as opções da forma atual (pode ser Alta). As escolhas são permanentes.
  - Exemplo: um Caterpie pode escolher Fuga como Alta Habilidade; um Butterfree só tem Fuga se ficou Caterpie até o Nível 40.
- Máximo natural de 2 Habilidades; até 3 temporariamente (Talentos, Golpes, itens).
- Todo pokémon pode escolher **Última Chance** ligada a um dos seus Tipos.
- **Ativação:**
  - Constante: sempre ativa.
  - Ativação [frequência]: é declarada e não gasta ação.
  - Gatilho [frequência]: só dispara na condição. "Gatilho Constante" dispara toda vez.
- Lista completa em `habilidades.csv`.

## Golpes: limites
- Até **8 Golpes**, dos quais no máximo **4 Ensináveis** (Tutor ou Registro). Os demais são Naturais (Nível ou evolução) ou Herdados.
- **Golpes Universais** (qualquer pokémon aprende por Tutor ou Registro): Bravata, Confidência, Descansar, Fachada, Multiplicar, Proteção, Ronco, Sonambulismo, Substituição.
- Registros (TM temporário / HM permanente) vendidos em Pokélojas: ver `itens.md`, categoria Registro.
- Usar um Golpe encerra o turno do pokémon. Formato e regras dos campos estão em `regras-combate.md`; lista completa em `golpes.csv`.

## Procriação
- O casal precisa de 8 h de privacidade. Role **1d100**: −2 por hora extra, até −10 (5 h).
- Limite: 1 teste por dia por humano. Pokémon que nunca evoluiu só procria a partir do Nível 25.

| Resultado | Efeito |
|---|---|
| 1–5 | Ovo da espécie materna ou paterna (à escolha) |
| 6–25 | Ovo da espécie materna |
| até 50 (pais da mesma família) | Ovo daquela família |

- O filhote nasce sabendo os Golpes que **ambos** os pais conhecem e que estão na lista de Golpes Herdados dele (**máx. 4**).

## Montarias
- **Viabilidade:** o tamanho (o Nível dá uma pista) e a Força importam. Com Força 1–2, o pokémon não carrega um humano. Equipamentos (biga, jangada, trenó) permitem combinar vários pokémons.
- **Montar:** gasta a Ação Padrão do humano e as Ações de Movimento e de Golpe do pokémon naquela rodada.
- **Penalidade da montaria:** Deslocamentos −3 e −1 Fase de Velocidade, a menos que o humano pese menos de 25% do pokémon.
- **Movimento montado:** o humano se move no turno dele com o Deslocamento do pokémon. No turno do pokémon, com Ação de Comando, ele pode se mover de novo usando outro tipo de Deslocamento.
- **Teste para não cair:** `1d20 + MA ou MV ≥ 12` (≥ 15 se o ataque tem Empurrão).
  - Quando: o humano ou a montaria sofre, num só ataque, mais de 1/5 dos PV máximos, ou recebe Confusão, Paralisia ou Sono.
  - No máximo 1 teste por ataque por rodada.

## Fósseis (Reanimação)
- Leva 6 h (mais o tempo para o pokémon ficar ativo). Role **1d20**. O fóssil é destruído, salvo no resultado 4–6.

| 1d20 | Resultado |
|---|---|
| 1 | O pokémon criado quebra tudo e foge |
| 2 | O equipamento falha e precisa de 1d10 dias de reparo |
| 3 | Falha |
| 4–6 | Falha, mas o fóssil não é destruído |
| 7–12 | Ovo da espécie, sem Golpes Herdados |
| 13–18 | Ovo da espécie, com Golpes Herdados |
| 19 | Clone idêntico ao original (Nível limitado ao Ataque Especial do operador) |
| 20 | 1d4 ovos com Golpes Herdados e chance de shiny |
