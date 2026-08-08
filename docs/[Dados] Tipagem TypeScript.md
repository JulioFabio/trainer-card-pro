---
tags: [documentacao-viva, projeto, status/ativo]
status: "ativo"
ultima_atualizacao: 2026-08-07
autor: "Antigravity"
---

## Resumo

Definição das interfaces e tipos TypeScript principais (`TrainerData`, `Pokemon`, `ItemData`, `NoteData`, `PokedexTheme`, etc.) no arquivo `types.ts`.



# 📦 Types

> Todas as interfaces e tipos TypeScript do [[[Visao Geral] Trainer Card Pro]].
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
- [[[Componente] App#Aba Combate]] — grid de atributos editáveis
- [[[Componente] PokemonCreationSheet#Sub-aba Stats]] — stats do Pokémon (com sub-objetos `base` e `lvl`)
- [[[Dados] Constantes#STAT_LABELS]] — mapeamento para labels de exibição

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
- [[[Componente] App#Aba Combate]] — lista de perícias interativas
- [[[Dados] Constantes#DEFAULT_SKILLS]] — 30+ perícias iniciais do PTU

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
- [[[Componente] App#Aba Mochila]] — itens do inventário
- [[[Arquitetura] Features e Regras#Aba Mochila]] — CRUD de itens

---

## Talent

```typescript
interface Talent {
  name: string;
  description: string;
}
```

Usado em:
- [[[Componente] App#Aba Treinador]] — lista de talentos com tooltip

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
- [[[Componente] PokemonCreationSheet#Sub-aba Golpes]] — grid de 8 golpes

---

## PokemonCapability

```typescript
interface PokemonCapability {
  name: string;
  value: string;                           // Ex: "5 KG", "Animal", "2 M"
}
```

Usado em:
- [[[Componente] PokemonCreationSheet#Sub-aba Capacidades]] — capacidades adicionais livres do Pokémon
- [[[Dados] Capacidades PTU]] — descrições automáticas por valor

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
- [[[Componente] PokemonCreationSheet]] — formulário de criação/edição
- [[[Componente] PcTab]] — armazenamento nos PC boxes
- [[[Componente] TeamTab]] — Pokémon ativos na equipe

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
- [[[Componente] PcTab]] — navegação entre 99 boxes
- [[[Componente] TeamTab]] — busca de Pokémon por ID nos boxes

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
  avatar: string | null;                   // Caminho do arquivo de imagem (/uploads/...) ou null
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
> `TrainerData` é a **interface raiz** de todo o estado da aplicação. É persistida no banco de dados SQLite relacional via endpoints Next.js e sincronizada via auto-save, com backup local em `localStorage` sob a chave `trainer_card_pro_offline_backup` em caso de erro de rede.

Usado em:
- [[[Componente] App]] — estado principal via `useState<TrainerData>`
- [[[Dados] Constantes#INITIAL_TRAINER_DATA]] — valores padrão

---

## 🏷️ Tags
#tipos #interfaces #typescript #dados


---

## Conexões

- **Consumidores:** [[[Componente] App]], [[[Componente] PokemonCreationSheet]], [[[Componente] TeamTab]], [[[Componente] PcTab]], [[[Componente] NotesTab]], [[[Rotas] API da Ficha]]

---

## Estado Atual e Próximos Passos

- [x] Tipagem completa e estrita de todas as estruturas de dados do aplicativo.
- [x] Sincronização entre modelo frontend e esquemas do Prisma.
- [ ] Refatorar enums numéricos para string unions mais descritivos.