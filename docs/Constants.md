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

Dados padrão para uma ficha nova. Valores notáveis:

| Campo | Valor Inicial |
|---|---|
| `nomePersonagem` | `'Carlos'` |
| `jogador` | `'Tulio'` |
| `conceito` | `'Gotta catch\'em all!'` |
| `levelGeral` | `2` |
| `hpActual` | `64` |
| `pcBoxes` | 99 boxes vazios |
| `equipe` | `[]` (vazia) |
| `anotacoes` | `'Cidade - Borges. Amiga Mãe: Alex. Entregar Pacote para Emilia.'` |
| `skills` | [[#DEFAULT_SKILLS]] |

Stats iniciais:
```
saude: 14, ataque: 6, defesa: 6,
atqEspecial: 12, defEspecial: 14, velocidade: 17
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
