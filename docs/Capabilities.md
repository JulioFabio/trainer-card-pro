# 🧠 Capabilities

> Banco de dados e tradutor automático de métricas de capacidade física e mental de Pokémon no sistema PTU.
> Arquivo: `src/data/capabilities.ts` — **36 linhas**
> Usado por: [[PokemonCreationSheet#Sub-aba Capacidades]]

---

## Visão Geral

No sistema de RPG de mesa **Pokémon: Tabletop United (PTU)**, as estatísticas de **Força (Force)**, **Salto (Jump)** e **Inteligência (Intelligence)** de um Pokémon são representadas por números inteiros simples de forma a facilitar cálculos. 

Este arquivo exporta dicionários de mapeamento estáticos que convertem esses inteiros em descrições e capacidades físicas reais no mundo do jogo, simplificando imensamente o trabalho do jogador de consultar o livro de regras.

---

## Mapeamentos de Capacidades

### 1. Força (`FORCE_CAPABILITY_DESCRIPTIONS`)
Mapeia o nível numérico de Força (1 a 10) para o peso limite em quilogramas (KG) que o Pokémon consegue carregar ou levantar:

```typescript
export const FORCE_CAPABILITY_DESCRIPTIONS: Record<number, string>
```

| Nível | Capacidade de Carga | Nível | Capacidade de Carga |
|---|---|---|---|
| **1** | Até 5 KG | **6** | Até 227 KG |
| **2** | Até 23 KG | **7** | Até 340 KG |
| **3** | Até 45 KG | **8** | Até 455 KG |
| **4** | Até 90 KG | **9** | Até 1135 KG |
| **5** | Até 158 KG | **10** | Até 1815 KG |

### 2. Salto (`JUMP_CAPABILITY_DESCRIPTIONS`)
Mapeia o valor de Salto (1 a 10) para a distância máxima horizontal ou vertical de salto em metros (M) que o Pokémon atinge:

```typescript
export const JUMP_CAPABILITY_DESCRIPTIONS: Record<number, string>
```

| Nível | Distância Máxima | Nível | Distância Máxima |
|---|---|---|---|
| **1** | 1 Metro | **6** | 7.6 Metros |
| **2** | 2 Metros | **7** | 10.6 Metros |
| **3** | 3 Metros | **8** | 15.2 Metros |
| **4** | 4.5 Metros | **9** | 21 Metros |
| **5** | 6 Metros | **10** | 30 Metros |

### 3. Inteligência (`INTELLIGENCE_CAPABILITY_DESCRIPTIONS`)
Mapeia o nível cognitivo do Pokémon (1 a 7) para rótulos qualitativos de cognição descritos no manual do mestre do PTU:

```typescript
export const INTELLIGENCE_CAPABILITY_DESCRIPTIONS: Record<number, string>
```

| Nível | Categoria de Inteligência | Descrição no RPG                                                 |
| ----- | ------------------------- | ---------------------------------------------------------------- |
| **1** | Vegetal                   | Reações puramente automáticas ou instintivas extremas            |
| **2** | Animal                    | Inteligência típica de um animal selvagem comum                  |
| **3** | Animal Inteligente        | Capaz de entender comandos complexos e táticas de matilha        |
| **4** | Deficiente                | Limiar de inteligência humana rudimentar, necessita de auxílio   |
| **5** | Humano                    | Nível cognitivo de um ser humano adulto saudável médio           |
| **6** | Superior                  | Inteligência altamente avançada, raciocínio abstrato superior    |
| **7** | Gênio                     | QI astronômico, computação rápida, telepatia ou hiper-raciocínio |

---

## Integração no Fluxo de Dados

A tradução automática ocorre no componente [[PokemonCreationSheet]]:
```typescript
const forceDesc = FORCE_CAPABILITY_DESCRIPTIONS[pokemon.capabilities.force.value] || "Desconhecido";
```

O jogador insere o valor do nível de capacidade nos campos numéricos apropriados, e a descrição estendida traduzida é renderizada em tempo real abaixo do campo como texto de apoio visual de regras.

---

## 🏷️ Tags
#dados #regras #ptu #capacidades #forca #salto #inteligencia
