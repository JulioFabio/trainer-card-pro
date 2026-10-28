# Concursos, Aptidões e Temperos

Fonte: Pokémon – RPG de Mesa, Livro do Jogador, p. 20–22, 25 e 198.

## Categorias
| Categoria | Aptidão | Sabor |
|---|---|---|
| Espetáculo | Estilo | Picante |
| Gincana | Perspicácia | Amargo |
| Concurso de Beleza (Desfile) | Beleza | Seco |
| Fisiculturismo | Vigor | Azedo |
| Concursinho (fofura) | Ternura | Doce |

## Aptidões
- Cada Aptidão vai até **12**. A soma das 5 Aptidões do pokémon vai até **20**; vai até 24 com a Característica Postura do Artista.
- Ao usar um Golpe no Concurso, pode-se **Apelar** a até 4 pontos da Aptidão do Golpe para somar à Pontuação. Os pontos gastos ficam fora da Aptidão até o fim do Concurso.

## Etapas
1. **Apresentação:** os Jurados pontuam a aparência (itens Mantidos, Acessórios, preparação).
2. **Apelação:** tantas rodadas quanto competidores. Em cada rodada, cada competidor escolhe **um Jurado** e usa **um Golpe**. Quem tiver a maior Pontuação no fim vence.
- A ordem da rodada segue as regras do Concurso (líder primeiro, último primeiro, sorteio…). As Pontuações não são reveladas, só a ordem de quem está na frente.
- Quando a plateia vota, ela conta como um Jurado.

## Pontuação de um Golpe
- Pontuação = Pontuação Basal do Descritor de Concurso do Golpe (tabela abaixo) + pontos Apelados.
- **+1d4** se o Golpe for da Aptidão da Categoria. O bônus se perde se o mesmo competidor repetir o mesmo Golpe em rodadas seguidas (exceto com Modéstia).
- Alguns Golpes têm Pontuação Basal própria, indicada entre parênteses no descritor, ex.: "Desfecho (2d4)".

## Expectativa dos Jurados
Cada Jurado começa com Expectativa **1**; o máximo é **6**. As Aptidões formam um ciclo:

**Estilo — Beleza — Ternura — Perspicácia — Vigor — (volta a Estilo)**

| Aptidão do Golpe em relação à da Categoria | Efeito na Expectativa |
|---|---|
| A mesma | +1 |
| Vizinha no ciclo | Nem sobe nem desce |
| Não vizinha | −1 (o Jurado se decepciona) |

- Quem levar um Jurado a **6** ganha **+4d4**.
- **Concursos de Celebridade** (grandes e televisionados):
  - Cada vez que a Expectativa de um Jurado sobe para um número **ímpar**, a dos outros Jurados cai 1.
  - Quem aumenta a Expectativa ganha **+Xd4**, em que X é a Expectativa antes do aumento.

## Descritores de Concurso
| Descritor | Pontuação Basal | Efeito |
|---|---|---|
| Abertura | 2d4 | +2d4 se for o primeiro da rodada |
| Abstração | 2d4 | A Expectativa do Jurado não pode subir nesta rodada |
| Clímax | 0 | Dobra a Pontuação ganha na próxima rodada |
| Cobiça | 0 | Corta à metade a Pontuação de quem pontuou logo antes e soma o que foi cortado à sua |
| Conquista | 2d4 | A Expectativa do Jurado não pode cair nesta rodada |
| Constrangimento | 2d4 | Seja qual for a Aptidão, reduz em 1 a Expectativa de todos os Jurados |
| Continuação | 0 | 1d4 se for o 1º ou 2º da rodada; 2d4 se for o 3º ou 4º; 3d4 se for o último |
| Dedicatória | 1d4 | +3d4 se ninguém mais escolheu o mesmo Jurado nesta rodada |
| Desfecho | 0 | Vale 15d4 se todos os competidores se apresentaram ao mesmo Jurado. Só pode ser usado como 4º ou 5º da rodada. |
| Despedida | 2d4 | Dobra a Pontuação na última rodada da Apelação |
| Encerramento | 2d4 | +2d4 se for o último da rodada |
| Entrada | 2d4 | Na próxima rodada, será o primeiro |
| Especial | — | Na próxima rodada, escolhe sua posição na ordem |
| Excentricidade | 2d4 | A Pontuação é Xd4, com X = 6 − Expectativa do Jurado antes do Golpe |
| Extravagância | — | Seja qual for a Aptidão, aumenta em 1 a Expectativa de todos os Jurados |
| Incentivo | 2d4 | +2d4 se o Golpe aumentar a Expectativa |
| Modelo | 0 | A Pontuação é Xd4, com X = Expectativa do Jurado antes do Golpe |
| Modéstia | 2d4 | Pode repetir em rodadas seguidas mantendo o +1d4, desde que seja da Aptidão do Concurso |
| Originalidade | — | Seja qual for a Aptidão, aumenta em 2 a Expectativa do Jurado |
| Pausa | 2d4 | Na próxima rodada, será o último |
| Perspectiva | 2d4 | +3d4 se a Expectativa do Jurado chegou ao máximo durante a rodada |
| Proveito | 1d4 | +3d4 se houve algum aumento de Expectativa nas duas últimas rodadas da Apelação |
| Reviravolta | 1d4 | +3d4 se tiver a menor Pontuação |
| Segurança | 3d4 | — |
| Sorteio | 2d4 | Na próxima rodada, a ordem é sorteada |
| Surpresa | 2d4 | Sempre é o primeiro da rodada, ignorando a ordem |

Vários Talentos de Artista trocam ou acrescentam Descritores de Concurso a um Golpe sem mudar a Pontuação Basal dele (ver `talentos.csv`).

## Temperos (melhoram as Aptidões)
- Feitos com até **5 frutas** (sabores das frutas em `itens.md`). O sabor mais presente define a Aptidão melhorada, pela tabela de Categorias acima.
- **Valor** = número de frutas (máx. 5). Em caso de empate entre dois sabores, cada Aptidão recebe metade.
  - Exemplos: Amargo 5 → Perspicácia +5. Doce e Seco 4 → Ternura +2 e Beleza +2.
- **Sabor de que o pokémon não gosta** (pela Natureza): metade do valor. **Sabor predileto:** +1.
- Depois do **5º Tempero**, as Aptidões não mudam mais (a Postura do Artista estende até a soma 24).

## Prêmios e XP
- Ganhar um Prêmio em Concurso dá 1 Nível de Personagem.
- Pokémons ganham XP em Concursos (Artista: +20%; Talento Perfeccionismo: +30% no 2º lugar, +80% no 1º).
