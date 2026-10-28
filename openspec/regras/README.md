# Pokémon – RPG de Mesa: contexto do Livro do Jogador

Extraído de *Pokémon – RPG de Mesa – Livro do Jogador* (tradução Biblioteca Élfica, 251 páginas).

As regras estão resumidas e organizadas. Os catálogos (golpes, habilidades, classes, talentos, itens, naturezas) foram extraídos de forma automática e completa, com o texto dos efeitos preservado.

## Arquivos
| Arquivo | Formato | Conteúdo | Linhas |
|---|---|---|---|
| `regras-personagem.md` | texto | Atributos, Modificadores, Perícias (tabelas de resultado), PV, Deslocamentos, Nível de Personagem, Classes, Armas, Pokéagenda | — |
| `regras-pokemon.md` | texto | PV, Relação Basal, Natureza, tabela de XP 1–100, Bônus Elemental, Lealdade, Evolução/Mega, Habilidades, limites de Golpes, Procriação, Montarias, Fósseis | — |
| `regras-combate.md` | texto | Iniciativa, Ações, Acurácia, Evasão, Fases, dano, tabela de Tipos, Condições, Terrenos, Fuga, Captura, campos e Descritores de Golpe | — |
| `regras-concursos.md` | texto | Categorias, Aptidões, Expectativa, Descritores de Concurso, Temperos | — |
| `src/data/catalogo/naturezas.md` | tabela | 35 naturezas | 35 |
| `src/data/catalogo/itens.md` | tabela | Itens gerais, Sucos, Frutas, Itens Mantidos, Medicinais, Pokébolas, Suplementos, Registros (TMs)… | 335 |
| `src/data/catalogo/golpes.csv` | CSV | Todos os Golpes | 670 |
| `src/data/catalogo/habilidades.csv` | CSV | Todas as Habilidades | 230 |
| `src/data/catalogo/classes.csv` | CSV | 9 Classes Básicas + 63 Avançadas | 72 |
| `src/data/catalogo/talentos.csv` | CSV | Características Gerais, Talentos Gerais, Características e Talentos de Classe | 955 |

**Não incluso:** Espécies (atributos base, Pokédex, golpes por nível, capacidades). Isso está no *Livro dos Pokémons*. A Chance de Captura base de cada espécie e as definições de Capacidades também vêm de lá.

## Convenções
- **CSV:** UTF-8 sem BOM, separador `,`, texto com vírgula entre aspas, uma linha por entrada, sem quebras de linha dentro das células.
- **Célula vazia = não existe.** Nunca "-" ou "N/A".
- **Listas dentro de uma célula** são separadas por `; `: `descritor` em golpes, `perícias` e `características` em classes, `sabores` em itens.
- **Tipos**, sempre com o nome da tradução oficial brasileira: Água, Aço, Dragão, Elétrico, Fada, Fantasma, Fogo, Gelo, Inseto, Lutador, Normal, Pedra, Planta, Psíquico, Sombrio, Terrestre, Venenoso, Voador. O livro usa as traduções antigas ("Metal", "Trevas", "Terra"); por decisão do Mestre elas foram trocadas por **Aço**, **Sombrio** e **Terrestre** nos catálogos e nos textos de regras. Ficaram como no livro só os nomes próprios de entradas que contêm essas palavras (Aura de Trevas, Metal Leve, Metal Pesado, Metal Precioso, Velocidade na Terra, Controle de Terra).
- **Atributos:** Saúde, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade.
- **Aptidões:** Estilo, Beleza, Ternura, Perspicácia, Vigor.

## Colunas
- **golpes.csv:** `nome, tipo, categoria, frequência, alcance, dano, precisão, descritor, efeito, aptidão, concurso`
  - `categoria`: Físico, Especial ou Status (Status = sem Dano Basal).
  - `frequência`: À Vontade, Rodada Sim Rodada Não, Por Encontro ou Diária.
  - `alcance`: Si, Corpo a Corpo, À Distância N, Área ou Ver Efeito.
  - `dano`: Dano Basal sem a palavra Físico/Especial (ex.: `2d10+8`), ou "Ver Efeito".
  - `precisão`: Dificuldade de Acurácia (número ou `Automática`).
  - `concurso`: Descritor de Concurso; Pontuação Basal especial entre parênteses.
- **habilidades.csv:** `nome, ativação, frequência, gatilho, efeito`
  - `ativação`: Constante, Ativação ou Gatilho.
  - `frequência`: À Vontade, Horária, Diária, Semanal, Por Encontro ou Constante (para Gatilho Constante).
- **classes.csv:** `nome, classe_base, tipo, requisitos, requisitos_multiclasse, perícias, características, descrição`
  - `tipo`: Básica ou Avançada.
  - `características`: nomes das 2 Características de Classe, que estão em `talentos.csv`.
- **talentos.csv:** `nome, classe, categoria, ação, legalidade, requisitos, frequência, alvo, gatilho, efeito, especial`
  - `classe`: "Geral" ou o nome da Classe.
  - `categoria`: Característica Geral, Talento Geral, Característica de Classe ou Talento de Classe.
  - `ação`: Contínuo, Padrão, Livre, Interrupção, Interrupção + Padrão ou Estendida (lido dos ícones do livro).
  - `legalidade`: Legal ou Ilegal (uso em batalha oficial).
  - O par (`nome`, `classe`) é único. Alguns nomes se repetem entre Classes diferentes (ex.: Proteção, Resistência, Rastreador).
- **naturezas.md:** `nome, aumenta, diminui, sabor_predileto, sabor_que_nao_gosta`
- **itens.md:** `nome, categoria, descrição, preço, frequência, sabores`

## Como os dados foram extraídos
- O **Tipo** e a **Aptidão** dos Golpes são ícones no livro. O Tipo saiu da imagem do ícone (18 imagens distintas, uma por Tipo). A Aptidão saiu da cor da fita: vermelho = Estilo, azul = Beleza, rosa = Ternura, verde = Perspicácia, amarelo = Vigor.
- Os campos **ação** e **legalidade** dos Talentos também vêm de ícones.
- Uma amostra foi conferida contra as páginas, sem divergências.

## Inconsistências do próprio livro (decisões do Mestre)
1. **Tabela de Nível de Personagem:** a coluna "Total de Atributos" não bate com a soma de "Ponto de Atributo". **Decidido: vale a soma dos pontos por nível.**
2. **Evasão Veloz:** **Decidido: Velocidade ÷ 5**, como as outras evasões (é o que o app já faz).
3. **Fases de Velocidade:** o livro só dá bônus de Deslocamento nas Fases −6, −3, +2, +4 e +6. **Decidido: as demais Fases têm bônus 0.**
4. **Gêiser de Fótons:** pode ser Físico ou Especial a cada uso. No CSV está como Físico, e o efeito explica.
5. **Talentos com o rótulo errado no livro:** "Rastreador" (Colecionador) e "Óculos Digitalizadores" (Engenheiro) trazem o efeito sob o rótulo "Alvo:". No CSV o texto foi movido para `efeito`.
6. **7 Talentos ficaram sem ícone de ação/legalidade** (coluna vazia): Paleta de Atitudes +, Estudo Comportamental, Buscador de Almas, Buscador de Almas +, Sobrevivente, Encorajamento, Qualquer Coisa que Você Possa Fazer!.
7. Algumas tabelas embutidas em textos longos viraram texto corrido dentro da célula (ex.: o resultado 1d6 de Acupuntura, as tabelas de Multiclasse de Domador, Guia e Especialista em `requisitos_multiclasse`). Os dados estão lá, mas sem formato de tabela.
