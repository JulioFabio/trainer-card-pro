// Ficha de teste do Túlio para o seed de desenvolvimento: equipe, PC em duas caixas, mochila e talentos.
// Só dados: nenhuma importação do app, para rodar direto no Node 24.

type Stat = { saude: number; ataque: number; defesa: number; atqEspecial: number; defEspecial: number; velocidade: number };

const stat = (s: number, a: number, d: number, sa: number, sd: number, v: number): Stat => ({
  saude: s, ataque: a, defesa: d, atqEspecial: sa, defEspecial: sd, velocidade: v,
});

interface PokemonSpec {
  id: string;
  slot: number;
  name: string;
  species: string;
  level: number;
  gender: 'M' | 'F' | 'U';
  types: string[];
  nature: string;
  base: Stat;
  lvl: Stat;
  trait: { name: string; description: string };
  abilities: { name: string; description: string }[];
  moves: { name: string; type: string; category: 'Físico' | 'Especial' | 'Status'; frequency: string; range: string; damage: string; accuracy: string; description: string }[];
}

function pokemon(spec: PokemonSpec) {
  const total = Object.fromEntries(
    (Object.keys(spec.base) as (keyof Stat)[]).map((k) => [k, spec.base[k] + spec.lvl[k]])
  ) as Stat;
  const hpMax = (total.saude + spec.level) * 3;
  return {
    id: spec.id,
    name: spec.name,
    species: spec.species,
    level: spec.level,
    gender: spec.gender,
    types: spec.types,
    ball: 'Poké Bola',
    slot: spec.slot,
    nature: spec.nature,
    natureFeatures: '',
    elementalDamageBonus: Math.floor(spec.level / 10),
    capabilityTrait: spec.trait,
    abilities: spec.abilities,
    stats: { ...total, base: spec.base, lvl: spec.lvl },
    hp: { current: hpMax, max: hpMax },
    evasions: { fisica: Math.floor(total.defesa / 5), especial: Math.floor(total.defEspecial / 5), veloz: Math.floor(total.velocidade / 5) },
    movements: { terrestre: 5, voo: 0, natacao: 2, subaquatico: 0, escavacao: 0 },
    capabilities: {
      force: { value: 2, description: 'Levantar 20 kg' },
      intelligence: { value: 3, description: '' },
      jump: { value: 2, description: '' },
      other: [{ name: 'Peso', value: '10 kg' }],
    },
    moves: spec.moves.map((m, i) => ({ id: String(i), descriptor: '', ...m })),
  };
}

const TACKLE = { name: 'Investida', type: 'NORMAL', category: 'Físico' as const, frequency: 'À Vontade', range: 'Corpo a Corpo', damage: '2d6+5', accuracy: '2', description: '' };

export function buildTulioSheet() {
  const emptyBoxes = Array.from({ length: 99 }, (_, i) => ({ id: i + 1, name: `Box ${i + 1}`, pokemons: [] as ReturnType<typeof pokemon>[] }));

  emptyBoxes[0].pokemons = [
    pokemon({
      id: '1730000000101', slot: 0, name: 'Faísca', species: 'Pikachu', level: 18, gender: 'M', types: ['ELÉTRICO'], nature: 'Alegre',
      base: stat(4, 5, 3, 5, 4, 9), lvl: stat(2, 3, 1, 3, 2, 4),
      trait: { name: 'Eletricidade', description: 'Gera descargas elétricas.' },
      abilities: [{ name: 'Estática', description: 'Pode paralisar quem o toca.' }, { name: 'Pára-raios', description: 'Atrai golpes elétricos.' }],
      moves: [
        { name: 'Choque do Trovão', type: 'ELÉTRICO', category: 'Especial', frequency: 'À Vontade', range: 'À Distância 6', damage: '2d8+8', accuracy: '2', description: 'Pode paralisar.' },
        { name: 'Cauda de Ferro', type: 'AÇO', category: 'Físico', frequency: 'Por Encontro', range: 'Corpo a Corpo', damage: '3d8+10', accuracy: '3', description: 'Pode reduzir a Defesa.' },
        TACKLE,
      ],
    }),
    pokemon({
      id: '1730000000102', slot: 1, name: 'Brasinha', species: 'Charmander', level: 14, gender: 'F', types: ['FOGO'], nature: 'Brava',
      base: stat(4, 5, 4, 5, 4, 6), lvl: stat(1, 3, 1, 3, 1, 2),
      trait: { name: 'Chama', description: 'Cauda acesa que marca sua saúde.' },
      abilities: [{ name: 'Chama Interna', description: 'Fortalece golpes de fogo com pouca vida.' }],
      moves: [
        { name: 'Brasas', type: 'FOGO', category: 'Especial', frequency: 'À Vontade', range: 'À Distância 4', damage: '2d6+6', accuracy: '2', description: 'Pode queimar.' },
        { name: 'Arranhão', type: 'NORMAL', category: 'Físico', frequency: 'À Vontade', range: 'Corpo a Corpo', damage: '1d8+6', accuracy: '2', description: '' },
      ],
    }),
    pokemon({
      id: '1730000000103', slot: 2, name: 'Casco', species: 'Squirtle', level: 12, gender: 'M', types: ['ÁGUA'], nature: 'Calma',
      base: stat(4, 4, 6, 4, 5, 3), lvl: stat(2, 1, 3, 1, 2, 1),
      trait: { name: 'Casco', description: 'Recolhe-se para se proteger.' },
      abilities: [{ name: 'Torrente', description: 'Fortalece golpes de água com pouca vida.' }],
      moves: [
        { name: 'Jato de Água', type: 'ÁGUA', category: 'Especial', frequency: 'À Vontade', range: 'À Distância 6', damage: '2d6+6', accuracy: '2', description: '' },
        { name: 'Refugiar-se', type: 'ÁGUA', category: 'Status', frequency: 'Por Encontro', range: 'Si', damage: '', accuracy: '', description: 'Aumenta a Defesa em 1 fase.' },
      ],
    }),
  ];

  emptyBoxes[0].pokemons.push(
    pokemon({
      id: '1730000000104', slot: 4, name: 'Fofinho', species: 'Eevee', level: 8, gender: 'F', types: ['NORMAL'], nature: 'Dócil',
      base: stat(5, 4, 4, 3, 5, 4), lvl: stat(1, 1, 1, 1, 1, 1),
      trait: { name: '', description: '' },
      abilities: [{ name: 'Adaptabilidade', description: '' }],
      moves: [TACKLE],
    }),
    pokemon({
      id: '1730000000105', slot: 5, name: 'Voa-Voa', species: 'Pidgey', level: 6, gender: 'M', types: ['NORMAL', 'VOADOR'], nature: 'Medrosa',
      base: stat(4, 4, 4, 3, 3, 5), lvl: stat(1, 1, 0, 0, 0, 1),
      trait: { name: 'Voo', description: '' },
      abilities: [{ name: 'Olhar Aguçado', description: '' }],
      moves: [{ name: 'Ataque de Asa', type: 'VOADOR', category: 'Físico', frequency: 'À Vontade', range: 'Corpo a Corpo', damage: '2d6+4', accuracy: '2', description: '' }],
    })
  );

  emptyBoxes[1].name = 'Ginásio';
  emptyBoxes[1].pokemons = [
    pokemon({
      id: '1730000000106', slot: 0, name: 'Rochedo', species: 'Onix', level: 22, gender: 'U', types: ['PEDRA', 'TERRESTRE'], nature: 'Rígida',
      base: stat(3, 4, 10, 2, 4, 7), lvl: stat(2, 3, 5, 1, 2, 3),
      trait: { name: 'Escavador', description: '' },
      abilities: [{ name: 'Cabeça de Pedra', description: 'Imune a dano de recuo.' }],
      moves: [
        { name: 'Lançar Pedras', type: 'PEDRA', category: 'Físico', frequency: 'Por Encontro', range: 'À Distância 6', damage: '2d10+10', accuracy: '4', description: '' },
        TACKLE,
      ],
    }),
  ];

  return {
    nomePersonagem: 'Túlio',
    jogador: 'Túlio',
    levelGeral: 5,
    idade: 16,
    peso: '60 kg',
    altura: '1,70 m',
    naturalidade: 'Cidade de Pallet',
    genero: 'Masculino',
    campanha: 'Mesa de Teste',
    classe1: 'Treinador',
    level1: 5,
    conceito: 'Começando a jornada com o Pikachu de família.',
    diasJornada: 12,
    pokedexCount: 6,
    stats: stat(6, 4, 4, 3, 3, 5),
    hpActual: 30,
    inventario: [
      { id: '1730000000201', name: 'Poção', description: 'Cura 20 PV.', quantity: 5 },
      { id: '1730000000202', name: 'Poké Bola', description: 'Captura Pokémon.', quantity: 12 },
      { id: '1730000000203', name: 'Antídoto', description: 'Cura envenenamento.', quantity: 2 },
      { id: '1730000000204', name: 'Mapa de Kanto', description: 'Mostra as rotas da região.', quantity: 1 },
    ],
    talentos: [
      { name: 'Rastreador', description: 'Segue pegadas de Pokémon selvagens.' },
      { name: 'Carisma de Treinador', description: 'Pokémon confiam mais facilmente.' },
    ],
    equipe: ['1730000000101', '1730000000102', '1730000000103'],
    pcBoxes: emptyBoxes,
  };
}
