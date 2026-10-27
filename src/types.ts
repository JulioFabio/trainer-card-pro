
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
  ranks: 0 | 1 | 2; // 0=Untrained, 1=Trained, 2=Expert
  bonus: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
}

export interface Talent {
  name: string;
  description: string;
}

export interface PokemonMove {
    id: string;
    name: string;
    type: string;
    category: 'Físico' | 'Especial' | 'Status';
    frequency: string;
    range: string;
    damage: string;
    accuracy: string;
    descriptor: string;
    description: string;
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
  imageUrl?: string; // Foto do Pokémon (base64 data URL)
  
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
  skills: Skill[];
  hpActual: number;
  talentos: Talent[];
  inventario: InventoryItem[];
  equipe: string[];
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
