import { INITIAL_TRAINER_DATA } from '@/constants';
import type { PCBox, StoredPokemon, TrainerData } from '@/types';

const stats = (n: number) => ({ saude: n, ataque: n + 1, defesa: n + 2, atqEspecial: n + 3, defEspecial: n + 4, velocidade: n + 5 });

export function makePokemon(id: string, slot: number, overrides: Partial<StoredPokemon> = {}): StoredPokemon {
  return {
    id,
    name: `Apelido ${id}`,
    species: 'Pikachu',
    level: 12,
    gender: 'M',
    types: ['ELÉTRICO'],
    ball: 'Poke Ball',
    slot,
    nature: 'Alegre',
    natureFeatures: '+2 Vel -2 Def',
    elementalDamageBonus: 1,
    capabilityTrait: { name: 'Faísca', description: 'Gera eletricidade' },
    abilities: [
      { name: 'Estática', description: 'Paralisa ao toque' },
      { name: '', description: '' },
    ],
    stats: { ...stats(5), base: stats(4), lvl: stats(1) },
    hp: { current: 30, max: 40 },
    evasions: { fisica: 1, especial: 2, veloz: 3 },
    movements: { terrestre: 5, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
    capabilities: {
      force: { value: 1, description: 'Levantar 5kg' },
      intelligence: { value: 2, description: '' },
      jump: { value: 1, description: '' },
      other: [{ name: 'Naturewalk', value: 'Floresta' }],
    },
    moves: [
      {
        id: '0',
        name: 'Choque do Trovão',
        type: 'ELÉTRICO',
        category: 'Especial',
        frequency: 'À Vontade',
        range: 'À Distância 6',
        damage: '2d8+6',
        accuracy: '2',
        descriptor: '',
        description: 'Pode paralisar',
      },
      {
        id: '1',
        name: 'Crescer',
        type: 'NORMAL',
        category: 'Status',
        frequency: 'Por Encontro',
        range: 'Si',
        damage: '',
        accuracy: '',
        descriptor: '',
        description: '',
      },
    ],
    ...overrides,
  };
}

/** Ficha realista: 3 itens, 2 talentos, 3 Pokémon em caixas diferentes (2 na equipe), caixa 5 renomeada. */
export function makeSheet(): TrainerData {
  const sheet: TrainerData = structuredClone(INITIAL_TRAINER_DATA);
  sheet.nomePersonagem = 'Túlio';
  sheet.hpActual = 20;
  sheet.inventario = [
    { id: '1730000000001', name: 'Poção', description: 'Cura 20 PV', quantity: 5 },
    { id: '1730000000002', name: 'Pokébola', description: '', quantity: 10 },
    { id: '1730000000003', name: 'Mapa', description: 'Mapa da região', quantity: 1 },
  ];
  sheet.talentos = [
    { name: 'Rastreador', description: 'Segue pegadas' },
    { name: 'Sorte', description: '' },
  ];
  const boxes: PCBox[] = sheet.pcBoxes;
  boxes[0].pokemons = [
    makePokemon('1730000001000', 0),
    makePokemon('1730000002000', 7, { species: 'Eevee', types: ['NORMAL'], name: 'Fofinho' }),
  ];
  boxes[4].name = 'Raros';
  boxes[4].pokemons = [makePokemon('1730000003000', 29, { species: 'Gyarados', types: ['ÁGUA', 'VOADOR'] })];
  sheet.equipe = ['1730000002000', '1730000001000'];
  return sheet;
}
