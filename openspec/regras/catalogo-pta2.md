# Catálogo de Regras — PTA 2.0

Fonte: `conteudo/pokemon-livro-do-jogador-biblioteca-elfica.txt`, onde "L123" indica a linha do arquivo.
Este catálogo é a especificação do motor de regras (M2). Os exemplos de cada regra viram testes automatizados.

## Como revisar

Cada regra tem um campo **Revisão**. Marque uma opção:

- `[x] Certa`: a regra vale assim na nossa mesa.
- `[x] Diferente na mesa`: descreva como vocês jogam.
- `[x] Varia por mestre`: vira uma "Opção de regra" do mundo. Descreva as alternativas.

Os itens marcados com ⚠ apontam algo a decidir: um trecho confuso do livro, uma contradição entre trechos ou uma divergência com o código atual.

Convenção geral (L475–478): **toda fração arredonda para baixo**, por exemplo "um quinto" ou "perde 30%".

---

## Capítulo 1 — Atributos e Modificadores (humanos)

### R1.1 Modificador de Atributo
- **Regra (L137–163):**
  - Atributo ≤ 9: `Mod = Atributo − 10`.
  - Atributo ≥ 10: `Mod = ⌊(Atributo − 10) / 2⌋`.
- **Exemplos:** Atributo 5 → −5; 9 → −1; 10 → 0; 11 → 0; 14 → 2; 18 → 4.
- ⚠ **Código atual:** usa `⌊(Atributo − 10) / 2⌋` para todos os valores (`App.tsx:254` e `:318`), então Atributo 5 dá −3 em vez de −5. **Esta é uma das contas quebradas.**
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R1.2 Fases não afetam Modificadores de humanos
- **Regra (L481):** os Modificadores de humanos são calculados sem as Fases.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R1.3 Bônus de Perícia
- **Regra (L196–214):**
  - Com a Perícia: `d20 + 2 + Mod` do Atributo ligado a ela.
  - Com a mesma Perícia pela segunda vez: `d20 + 4 + 2×Mod`. Não acumula uma terceira vez.
  - Sem a Perícia: só `d20`.
- **Exemplo:** Mod 3, Perícia uma vez → d20+5; duas vezes → d20+10.
- **Exceção:** as Perícias de Saúde (Apneia, Imunidade, Jejum, Resiliência) não são roladas. Repetir uma delas não dá benefício (L225–232).
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R1.4 Resultado de teste de Perícia
- **Regra (L219–224):**
  - Abaixo de 5: falha completa.
  - De 5 a 14: resultado típico de quem não é treinado.
  - Acima de 14: resultado de treino ou sorte.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 2 — Pontos de Vida

### R2.1 PV máximos do humano
- **Regra (L240–247):** a Saúde não tem Modificador. `PV máx = (Nível + Saúde) × 4`.
- **Exemplo:** Nível 5 e Saúde 8 → 52.
- **Código atual:** está igual (`App.tsx:264`).
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R2.2 PV máximos do Pokémon
- **Regra (L520–528):** `PV máx = Nível + 3 × Saúde`.
- **Exemplo:** Charmander Nível 1, Saúde 4 → 1 + 12 = **13**. No Nível 20, com Saúde 7 → 20 + 21 = **41**.
- ⚠ **Código atual:** usa `(Saúde + Nível) × 3` (`PokemonCreationSheet.tsx:108` e `:165`). No Nível 20 com Saúde 7, isso dá 81 em vez de 41: **o nível é triplicado**. **Esta é uma das contas quebradas.**
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R2.3 Inconsciência e morte
- **Regra (L100–115, L522–526):**
  - PV atuais em 0 deixam o personagem inconsciente; um Pokémon nessa situação não age.
  - PV negativos podem levar à morte. O limite exato está no capítulo de Condições, ainda não catalogado.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R2.4 Descanso
- **Regra (L354–359):** um descanso de 8 horas recupera 10% dos PV máximos.
- **Opcional:** um teste de Regeneração muda a cura conforme o resultado:

  | Resultado | Cura |
  |---|---|
  | 1 | nada |
  | 5 | 10% |
  | 10 | 15% |
  | 15 | 25% |
  | 20 | 50% |
  | 30 | 100% e remove aflições |

- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 3 — Evasão

### R3.1 Evasões base
- **Regra (L497–509):**
  - `Evasão Física = ⌊Defesa / 5⌋`
  - `Evasão Especial = ⌊Def. Especial / 5⌋`
  - `Evasão Veloz = ⌊Velocidade / 5⌋`
  - Cada valor base vai **no máximo a 6**. Bônus de outras fontes levam até **9**, que é o teto absoluto.
- **Exemplo:** Defesa 17 → 3; Defesa 40 → 6, por causa do teto.
- ⚠ **Contradição no livro:** na seção de Pokémon (L550–553), o texto diz "para cada **10** pontos de Velocidade, 1 de Evasão". Com isso, a Evasão Veloz do Pokémon seria `⌊Velocidade / 10⌋`. **Qual vale: /5 para todos ou /10 para Pokémon?**
- ⚠ **Código atual:** o humano não tem o teto de 6 (`App.tsx:268–271`), e a Evasão do Pokémon é digitada à mão (`PokemonCreationSheet.tsx:79`).
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R3.2 Qual Evasão se aplica
- **Regra (L484–495):**
  - Contra ataque físico: usa a maior entre Física e Veloz.
  - Contra ataque especial: usa a maior entre Especial e Veloz.
  - As evasões nunca se somam.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R3.3 Evasão e mudanças temporárias
- **Regra (L521–535):**
  - Fases e aumentos temporários de Atributo **não** mudam a Evasão. Só mudanças permanentes mudam.
  - Um efeito que altera a "Evasão" diretamente afeta as três ao mesmo tempo.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R3.4 Acerto automático
- **Regra (L513–519):** um Teste de Acurácia com resultado 20 sempre acerta, mesmo se a Evasão levar a dificuldade acima de 20.
- ⚠ **A confirmar:** o 20 vale como "20 natural no dado" ou como "resultado total 20"? O texto diz "cujo resultado seja 20".
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 4 — Fases (stages)

### R4.1 Escala e efeito
- **Regra (L538–543, L449–480):**
  - A Fase vai de −6 a +6 por Atributo.
  - Cada Fase acima de 0 soma **+25%** ao Atributo. Cada Fase abaixo de 0 tira **−10%**.

  | Fase | −6 | −5 | −4 | −3 | −2 | −1 | 0 | +1 | +2 | +3 | +4 | +5 | +6 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|---|
  | % | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 125 | 150 | 175 | 200 | 225 | 250 |

- **Exemplo:** Ataque 17 na Fase +2 → ⌊17 × 1,5⌋ = **25**. Na Fase −3 → ⌊17 × 0,7⌋ = **11**.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R4.2 Fases de Velocidade e Deslocamento
- **Regra (L449–476):** as Fases de Velocidade também mudam os Deslocamentos, sem deixar nenhum abaixo de 1.
- ⚠ **Tabela embaralhada no PDF.** Minha leitura é esta:

  | Fases | Deslocamento |
  |---|---|
  | −6 | −2 |
  | −3 a −5 | −1 |
  | −1 e −2 | 0 |
  | +1 | 0 |
  | +2 e +3 | +1 |
  | +4 e +5 | +2 |
  | +6 | +3 |

  **Confirmar.**
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R4.3 Duração
- **Regra (L476–480):**
  - As Fases somem no fim do combate.
  - Um Pokémon que volta para a pokébola também perde as Fases.
  - Fora de combate, uma Fase dura 10 minutos.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 5 — Atributos do Pokémon

### R5.1 Basal + Níveis = Total
- **Regra (L554–560):**
  - A ficha guarda separados o **Atributo Basal** (o da espécie, já ajustado pela Natureza) e os **pontos de Nível**.
  - O **Total** é a soma dos dois.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.2 Pontos por Nível
- **Regra (L579–582):** o Pokémon ganha 1 ponto de Atributo a cada Nível acima do 1, ou seja, `Nível − 1` pontos no total.
- **Exemplo (L597–607):** Charmander Nível 20 tem 19 pontos, distribuídos como 3+3+3+3+3+4.
- ⚠ **Erro no livro:** no exemplo do Charmander Bravo (L584–596), os pontos somam +10+5+5 = **20**, não 19.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.3 Relação Basal
- **Regra (L572–587):**
  - A Relação Basal é a ordem dos Atributos Basais, do maior para o menor.
  - Depois de distribuir os pontos de Nível, a ordem dos Totais precisa respeitar essa ordem: um Atributo com Basal maior nunca pode ficar com Total menor que um de Basal menor.
- **Exemplo:** Charmander tem Basal Vel 7 > AtE 6 > Atq 5 = DfE 5 > Saúde 4 = Def 4. No Nível 2, o único ponto possível vai para Velocidade.
- ⚠ **A decidir:** quando dois Basais empatam, os Totais podem passar um do outro?
  - O exemplo de L584–596 deixa: no Charmander Bravo, Vel e DfE têm Basal 5, e no Total fica Vel 10 contra DfE 5.
  - Proposta: **empatados podem se separar**, mas nenhum Atributo pode ultrapassar outro de Basal estritamente maior.
- **Automação proposta:** o motor **valida** a distribuição e mostra o erro, mas não distribui sozinho. Também pode **sugerir** onde colocar o próximo ponto.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.4 Natureza
- **Regra (L578–615, tabela L619–663):**
  - A Natureza soma **+2** a um Atributo Basal e tira **−2** de outro.
  - **Exceção:** quando o Atributo é a Saúde, o ajuste é de **±1**.
  - Nenhum Atributo Basal fica abaixo de **1** por causa da Natureza.
  - As 5 Naturezas neutras não mudam nada: Comedida, Chata, Paciente, Sensata e Estoica.
- **Exemplos:**
  - Charmander Bravo (+Atq −Vel): Atq 5 → 7 e Vel 7 → 5.
  - Ousada (+Saúde −Atq) num Basal com Saúde 4 e Atq 5: Saúde 5 e Atq 3.
  - Desesperada (+Atq −Saúde) com Saúde 1: a Saúde continua 1, por causa do mínimo.
- **Ordem de aplicação (L665–668):** Basal da espécie → Natureza → pontos de Nível.
- ⚠ **Código atual:** a Natureza só mostra o texto "+X / −Y" e **não altera nenhum Atributo** (`PokemonCreationSheet.tsx:263–267`). **Esta é a automação de natureza que está faltando.**
- **Tabela completa:** já está correta no código (`PokemonCreationSheet.tsx:24–42`). Faltam os sabores preferido e rejeitado, que estão em L619–663.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.5 Evolução
- **Regra (L669–671):**
  - Ao evoluir, o Basal passa a ser o da nova espécie, com a Natureza aplicada de novo.
  - **Todos** os pontos de Nível são redistribuídos conforme a nova Relação Basal.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.6 Vitaminas
- **Regra (L672–679):**
  - Cada Vitamina altera o Basal. Um Pokémon recebe no máximo **5 Vitaminas na vida**.
  - Se a Relação Basal mudar, os próximos pontos de Nível seguem a nova ordem. Os pontos já distribuídos não são redistribuídos.
- ⚠ O bônus de cada Vitamina está no capítulo de Itens, ainda não catalogado.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R5.7 Megaevolução
- **Regra (L691–706):**
  - Muda o Basal **temporariamente**, sem redistribuir os pontos de Nível.
  - Concede uma Habilidade, respeitando o limite de 2, e pode mudar o Tipo.
  - Dura 10 minutos ou até os PV chegarem a 0 ou menos.
  - Exige o Talento Mega!, uma Pedra-Chave, uma Ação Padrão e a Megapedra como item Mantido.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 6 — Nível, Experiência e Lealdade

### R6.1 Tabela de Experiência
- **Regra (L716–737):** o Nível é determinado pela XP acumulada. Alguns pontos da tabela:
  - **Nível 1 a 10:** 0, 25, 50, 100, 150, 200, 400, 600, 800, 1000.
  - **Nível 11 a 20:** de 1.000 em 1.000, com uma irregularidade (11 = 1.500 e 12 = 2.000), chegando a 20 = 10.000.
  - **Nível 21 a 40:** +1.500 por nível até o 30 (25.000), depois +2.500 até o 40 (50.000).
  - **Nível 41 a 60:** +5.000 por nível até o 50 (100.000), depois +10.000 até o 60 (200.000).
  - **Nível 61 a 100:** +10.000 por nível, até o 100 (600.000).
- **No motor:** a tabela completa vira um arquivo de dados.
- **Exemplo:** 4.200 de XP corresponde ao Nível 14.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R6.2 Lealdade
- **Regra (L665–690, L4056):**
  - A Lealdade vai de 0 a 4 e é controlada pelo Narrador, que pode escondê-la do jogador.
  - **Valores iniciais típicos:** 1 para Pokémon capturado, 2 para nascido de ovo, 4 para o inicial bem tratado.
- **Proposta para o VTT:** a Lealdade é um campo **visível só para o mestre**.
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

### R6.3 Bônus Elemental (STAB)
- **Regra (L740–748):**
  - Quando o Pokémon usa um Golpe de um dos seus Tipos, ganha um dano adicional de `⌊Nível / 5⌋`.
  - Humanos não recebem esse bônus.
- **Exemplo:** Nível 14 → +2; Nível 20 → +4.
- ⚠ **Código atual:** o bônus é digitado à mão (`elementalDamageBonus`).
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 7 — Deslocamento (humanos)

### R7.1 Deslocamentos
- **Regra (L458–471):**
  - **Terrestre:** `3 + ⌊max(MA, MV) / 2⌋`, com mínimo de **5**.
  - **Natação:** `2 + ⌊MD / 2⌋`, com mínimo de **4**.
  - **Subaquático:** 3. Passa a **4** se o MA ou o MD for ≥ 3.
- **Exemplo:** MA 2 e MV 4 → Terrestre 3 + 2 = 5. MD 6 → Natação 2 + 3 = 5.
- ⚠ **A confirmar:** "metade de seu MA ou MV" significa usar o maior dos dois, ou o jogador escolhe?
- ⚠ **Código atual:** usa `5 + ⌊Velocidade / 2⌋`, Natação = metade do Terrestre e Subaquático = metade da Natação (`App.tsx:276–278`). **Tudo diferente do livro.**
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Capítulo 8 — Iniciativa (prévia; o combate será catalogado depois)

### R8.1 Ordem de turno
- **Regra (L751–763):**
  - A rodada dura 6 segundos.
  - Os **humanos agem primeiro**, da maior para a menor Velocidade. Depois agem os **Pokémon**, também da maior para a menor Velocidade.
  - **Ações do humano:** Comando, Movimento e Padrão.
  - **Ações do Pokémon:** Movimento e Golpe.
  - Os dois podem fazer Ações Livres.
- ⚠ **A decidir:**
  - A Iniciativa usa a Velocidade **com** Fases?
  - Como desempatar?
- **Revisão:** [ ] Certa  [ ] Diferente na mesa  [ ] Varia por mestre

---

## Resumo: contas quebradas no código atual

| # | Regra | Livro | Código atual |
|---|---|---|---|
| 1 | R2.2 PV do Pokémon | `Nível + 3×Saúde` | `(Saúde + Nível) × 3` |
| 2 | R5.4 Natureza | ajusta o Basal (±2, Saúde ±1, mínimo 1) | só mostra texto |
| 3 | R1.1 Modificador ≤ 9 | `Atributo − 10` | `⌊(Atributo − 10)/2⌋` |
| 4 | R7.1 Deslocamentos | baseados em MA/MV/MD | baseados em Velocidade |
| 5 | R3.1 Evasão | teto de 6 e cálculo automático | sem teto (humano) e manual (Pokémon) |
| 6 | R6.3 Bônus Elemental | `⌊Nível/5⌋` | manual |

## Próximos capítulos a catalogar

Ações e combate, Dano e tipos (tabela de efetividade), Condições, Captura, Itens (Vitaminas), Talentos e Classes.
