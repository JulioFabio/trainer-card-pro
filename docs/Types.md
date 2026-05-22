# 📦 Types

> Todas as interfaces e tipos TypeScript do [[Trainer Card Pro]].
> Arquivo: `types.ts`

---

## Stats

```typescript
interface Stats {
  saude: number;
  ataque: number;
  defesa: number;
  atqEspecial: number;
  defEspecial: number;
  velocidade: number;
}
```

Usado em:
- [[App#Aba Combate]] — grid de atributos editáveis
- [[PokemonCreationSheet#Sub-aba Stats]] — stats do Pokémon (com sub-objetos `base` e `lvl`)
- [[Constants#STAT_LABELS]] — mapeamento para labels de exibição

---

## Skill

```typescript
interface Skill {
  name: string;
  attr: keyof Stats;     // Atributo associado (ex: 'ataque')
  ranks: 0 | 1 | 2;     // 0=Untrained, 1=Trained, 2=Expert
  bonus: number;         // Bônus adicional fixo
}
```

Usado em:
- [[App#Aba Combate]] — lista de perícias interativas
- [[Constants#DEFAULT_SKILLS]] — 30+ perícias iniciais do PTU

---

## InventoryItem

```typescript
interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}
```

Usado em:
- [[App#Aba Mochila]] — itens do inventário
- [[Features#Aba Mochila]] — CRUD de itens

---

## Talent

```typescript
interface Talent {
  name: string;
  description: string;
}
```

Usado em:
- [[App#Aba Treinador]] — lista de talentos com tooltip

---

## PokemonMove

```typescript
interface PokemonMove {
  id: string;
  name: string;
  type: string;                              // Ex: 'FOGO', 'ÁGUA'
  category: 'Físico' | 'Especial' | 'Status';
  frequency: string;
  range: string;                             // Alcance
  damage: string;
  accuracy: string;                          // Precisão / AC
  descriptor: string;                        // Descritor do golpe
  description: string;
}
```

Usado em:
- [[PokemonCreationSheet#Sub-aba Golpes]] — grid de 8 golpes

---

## PokemonCapability

```typescript
interface PokemonCapability {
  name: string;
  value: string;                           // Ex: "5 KG", "Animal", "2 M"
}
```

Usado em:
- [[PokemonCreationSheet#Sub-aba Capacidades]] — capacidades adicionais livres do Pokémon
- [[Capabilities]] — descrições automáticas por valor

---

## StoredPokemon

```typescript
interface StoredPokemon {
  id: string;
  name: string;
  species: string;
  level: number;
  gender: 'M' | 'F' | 'U';
  types: string[];                         // Até 2 tipos
  ball: string;
  slot: number;                            // Slot ocupado no PC (0 a 29)
  imageUrl?: string;                       // Foto do Pokémon (base64 data URL opcional)
  nature: string;
  natureFeatures: string;                  // Ex: "Orgulhoso -2 Sp. Atk +2 Saude"
  elementalDamageBonus: number;
  
  hp: {
    current: number;
    max: number;
  };
  
  stats: Stats & {
    base: Stats;                           // Valores base
    lvl: Stats;                            // Bônus por nível
  };
  
  movements: {
    terrestre: number;
    voo: number;
    natacao: number;
    subaquatico: number;
    escavacao: number;
  };
  
  evasions: {
    fisica: number;
    especial: number;
    veloz: number;
  };
  
  capabilities: {
    force: { value: number; description: string };
    intelligence: { value: number; description: string };
    jump: { value: number; description: string };
    other: PokemonCapability[];
  };
  
  capabilityTrait: {
    name: string;
    description: string;
  };
  
  abilities: Array<{
    name: string;
    description: string;
  }>;
  
  moves: PokemonMove[];
}
```

Usado em:
- [[PokemonCreationSheet]] — formulário de criação/edição
- [[PcTab]] — armazenamento nos PC boxes
- [[TeamTab]] — Pokémon ativos na equipe

---

## PCBox

```typescript
interface PCBox {
  id: number;
  name: string;
  pokemons: StoredPokemon[];
}
```

Usado em:
- [[PcTab]] — navegação entre 99 boxes
- [[TeamTab]] — busca de Pokémon por ID nos boxes

---

## TrainerData

```typescript
interface TrainerData {
  nomePersonagem: string;
  jogador: string;
  classe1: string;
  level1: number;
  classe2: string;
  level2: number;
  classe3: string;
  level3: number;
  classe4: string;
  level4: number;
  conceito: string;
  avatar: string | null;                   // Base64 da imagem ou null
  diasJornada: number;
  pokedexCount: number;
  stats: Stats;
  skills: Skill[];
  hpActual: number;
  talentos: Talent[];
  inventario: InventoryItem[];
  equipe: string[];                        // Array de IDs de StoredPokemon na equipe ativa
  pcBoxes: PCBox[];
  anotacoes: string;
  levelGeral: number;
  idade: number;
  peso: string;
  altura: string;
  naturalidade: string;
  genero: string;
  campanha: string;
}
```

> [!IMPORTANT]
> `TrainerData` é a **interface raiz** de todo o estado da aplicação. É serializada para localStorage e pode ser exportada/importada como JSON.

Usado em:
- [[App]] — estado principal via `useState<TrainerData>`
- [[Constants#INITIAL_TRAINER_DATA]] — valores padrão

---

## 🏷️ Tags
#tipos #interfaces #typescript #dados
