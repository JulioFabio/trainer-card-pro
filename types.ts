
export interface Stats {
  saude: number;
  ataque: number;
  defesa: number;
  atqEspecial: number;
  defEspecial: number;
  velocidade: number;
}

export interface Skill {
  name: string;
  attr: keyof Stats;
  value?: number; // Propriedade legada ou para cache
  ranks: 0 | 1 | 2; // 0=Untrained, 1=Trained, 2=Expert
  bonus: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface TeamMember {
  id: string;
  name: string;
  species: string;
  ball: string;
}

export interface Talent {
  name: string;
  description: string;
}

export interface PokemonMove {
    id: string;
    name: string;
    type: string;
    category: 'Físico' | 'Especial' | 'Status'; // "aprensentação" in image seems to be category
    frequency: string;
    range: string; // "alcance"
    damage: string;
    accuracy: string; // "precisão" or "AC"
    overhead: string; // The top-right number (e.g. "2") - Keeping for backward compat or alternate view
    descriptor: string; // New field for "Descritor"
    description: string;
    descriptors: string[]; // "descritor" - Leaving for now
}

export interface PokemonCapability {
    name: string;
    value: string; // e.g. "5 KG", "Animal", "2 M"
}

export interface StoredPokemon {
  id: string;
  name: string;
  species: string;
  level: number;
  gender: 'M' | 'F' | 'U';
  types: string[]; 
  ball: string; 
  slot: number;
  
  // Extended Fields
  nature: string;
  natureFeatures: string; // "Orgulhoso -2 Sp. Atk +2 Saude"
  elementalDamageBonus: number;
  
  capabilityTrait: {
      name: string;
      description: string;
  };
  
  abilities: {
      name: string;
      description: string;
  }[];
  
  stats: Stats & {
      base: Stats; // "Base" column
      lvl: Stats;  // "Lvl" column
  };
  
  hp: {
      current: number;
      max: number;
  };
  
  evasions: {
      fisica: number;
      especial: number;
      veloz: number;
  };
  
  movements: {
      terrestre: number;
      voo: number;
      natacao: number;
      subaquatico: number;
      escavacao: number;
  };

  capabilities: {
      force: { value: number; description: string };
      intelligence: { value: number; description: string };
      jump: { value: number; description: string };
      other: PokemonCapability[];
  };

  moves: PokemonMove[];
}

export interface PCBox {
  id: number;
  name: string;
  pokemons: StoredPokemon[];
}

export interface TrainerData {
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
  avatar: string | null;
  diasJornada: number;
  pokedexCount: number;
  stats: Stats;
  skills: Skill[]; // Nova lista completa de perícias
  hpActual: number;
  hpMax: number;
  talentos: Talent[];
  inventario: InventoryItem[];
  equipe: TeamMember[];
  pcBoxes: PCBox[];
  anotacoes: string;
  // Novos campos solicitados
  levelGeral: number;
  idade: number;
  peso: string;
  altura: string;
  naturalidade: string;
  genero: string;
  campanha: string;
  evasao: {
    fisica: number;
    especial: number;
    veloz: number;
  };
  movimento: {
    terrestre: number;
    natacao: number;
    subaquatico: number;
  };
}
