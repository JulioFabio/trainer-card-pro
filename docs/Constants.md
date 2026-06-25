---
tags: [documentacao-viva, projeto, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-06-15
autor: "Antigravity"
---

# ⚙️ Constants

> Todas as constantes, temas e dados iniciais do [[Trainer Card Pro]].
> Arquivo: `constants.ts`

---

## BASE_POINTS

```typescript
export const BASE_POINTS = 66;
```

Base de pontos de atributo disponíveis no nível 0. Usado no cálculo de [[Features#Pontos de Atributo|pontos máximos]].

---

## MAX_STAT_INITIAL

```typescript
export const MAX_STAT_INITIAL = 14;
```

Cap máximo base de cada atributo. Aumenta com o nível via `MAX_STAT_INITIAL + floor(Nível / 2)`.

---

## STAT_LABELS

```typescript
export const STAT_LABELS: Record<string, string> = {
  saude: 'Saúde',
  ataque: 'Ataque',
  defesa: 'Defesa',
  atqEspecial: 'Atq. Esp',
  defEspecial: 'Def. Esp',
  velocidade: 'Velocidade',
};
```

Labels de exibição para os 6 [[Types#Stats|atributos]]. Usado no [[App#Aba Combate]] e no [[PokemonCreationSheet]].

---

## DEFAULT_SKILLS

```typescript
export const DEFAULT_SKILLS: { name: string; attr: keyof TrainerData['stats']; ranks: 0 | 1 | 2; bonus: number }[]
```

Lista de **24 perícias** do sistema, organizadas por atributo:

### Por Saúde
| Nome |
|---|
| Apneia |
| Imunidade |
| Jejum |
| Resiliência |

### Por Ataque
| Nome |
|---|
| Corrida |
| Força |
| Intimidação |
| Salto |

### Por Defesa
| Nome |
|---|
| Concentração |
| Deflexão |
| Incansável |
| Regeneração |

### Por Atq. Especial
| Nome |
|---|
| Engenharia |
| História |
| Investigação |
| Programação |

### Por Def. Especial
| Nome |
|---|
| Empatia |
| Manipulação |
| Manha |
| Percepção |

### Por Velocidade
| Nome |
|---|
| Acrobacia |
| Furtividade |
| Performance |
| Prestidigitação |

Todas iniciam com `ranks: 0, bonus: 0`.

---

## INITIAL_TRAINER_DATA

```typescript
export const INITIAL_TRAINER_DATA: TrainerData
```

Dados padrão para uma ficha nova. Valores notáveis (inicialização limpa/pristina):

| Campo | Valor Inicial |
|---|---|
| `nomePersonagem` | `''` (vazio) |
| `jogador` | `''` (vazio) |
| `conceito` | `''` (vazio) |
| `levelGeral` | `1` |
| `hpActual` | `0` |
| `pcBoxes` | 99 boxes vazios |
| `equipe` | `[]` (vazia) |
| `anotacoes` | `''` (vazio) |
| `skills` | [[#DEFAULT_SKILLS]] |

Stats iniciais:
```
saude: 0, ataque: 0, defesa: 0,
atqEspecial: 0, defEspecial: 0, velocidade: 0
```

---

## PokedexTheme

```typescript
export interface PokedexTheme {
  id: string;
  main: string;
  dark: string;
  light: string;
  text: string;
  color: string;
}
```

---

## POKEDEX_THEMES

```typescript
export const POKEDEX_THEMES: PokedexTheme[]
```

| ID | Nome / Classes | Cor Hex |
|---|---|---|
| `rose` | `bg-rose-600` | `#e11d48` |
| `blue` | `bg-blue-600` | `#2563eb` |
| `emerald` | `bg-emerald-600` | `#059669` |
| `amber` | `bg-amber-600` | `#d97706` |
| `slate` | `bg-slate-700` | `#334155` |

Usado em:
- [[App]] — seletor de tema no header
- [[Features#Sistema de Temas]] — propagação de cores

---

## 🏷️ Tags
#constantes #dados #configuração #temas
