
import { TrainerData } from './types';

export const BASE_POINTS = 66;
export const POINTS_PER_LEVEL = 2;
export const MIN_STAT = 6;
export const MAX_STAT_INITIAL = 14;

export const STAT_LABELS: Record<string, string> = {
  saude: 'Saúde',
  ataque: 'Ataque',
  defesa: 'Defesa',
  atqEspecial: 'Atq. Esp',
  defEspecial: 'Def. Esp',
  velocidade: 'Velocidade',
};

export const STAT_COLORS: Record<string, string> = {
  saude: 'bg-rose-500',
  ataque: 'bg-orange-500',
  defesa: 'bg-blue-500',
  atqEspecial: 'bg-purple-500',
  defEspecial: 'bg-emerald-500',
  velocidade: 'bg-amber-500',
  };

export const DEFAULT_SKILLS: { name: string; attr: keyof TrainerData['stats']; ranks: 0 | 1 | 2; bonus: number }[] = [
  // Saúde
  { name: 'Apneia', attr: 'saude', ranks: 0, bonus: 0 },
  { name: 'Imunidade', attr: 'saude', ranks: 0, bonus: 0 },
  { name: 'Jejum', attr: 'saude', ranks: 0, bonus: 0 },
  { name: 'Resiliência', attr: 'saude', ranks: 0, bonus: 0 },
  // Ataque
  { name: 'Corrida', attr: 'ataque', ranks: 0, bonus: 0 },
  { name: 'Força', attr: 'ataque', ranks: 0, bonus: 0 },
  { name: 'Intimidação', attr: 'ataque', ranks: 0, bonus: 0 },
  { name: 'Salto', attr: 'ataque', ranks: 0, bonus: 0 },
  // Defesa
  { name: 'Concentração', attr: 'defesa', ranks: 0, bonus: 0 },
  { name: 'Deflexão', attr: 'defesa', ranks: 0, bonus: 0 },
  { name: 'Incansável', attr: 'defesa', ranks: 0, bonus: 0 },
  { name: 'Regeneração', attr: 'defesa', ranks: 0, bonus: 0 },
  // Ataque Especial
  { name: 'Engenharia', attr: 'atqEspecial', ranks: 0, bonus: 0 },
  { name: 'História', attr: 'atqEspecial', ranks: 0, bonus: 0 },
  { name: 'Investigação', attr: 'atqEspecial', ranks: 0, bonus: 0 },
  { name: 'Programação', attr: 'atqEspecial', ranks: 0, bonus: 0 },
  // Defesa Especial
  { name: 'Empatia', attr: 'defEspecial', ranks: 0, bonus: 0 },
  { name: 'Manipulação', attr: 'defEspecial', ranks: 0, bonus: 0 },
  { name: 'Manha', attr: 'defEspecial', ranks: 0, bonus: 0 },
  { name: 'Percepção', attr: 'defEspecial', ranks: 0, bonus: 0 },
  // Velocidade
  { name: 'Acrobacia', attr: 'velocidade', ranks: 0, bonus: 0 },
  { name: 'Furtividade', attr: 'velocidade', ranks: 0, bonus: 0 },
  { name: 'Performance', attr: 'velocidade', ranks: 0, bonus: 0 },
  { name: 'Prestidigitação', attr: 'velocidade', ranks: 0, bonus: 0 },
];

export const INITIAL_TRAINER_DATA: TrainerData = {
  nomePersonagem: 'Carlos',
  jogador: 'Tulio',
  levelGeral: 2,
  idade: 16,
  peso: '60kg',
  altura: '1,64',
  naturalidade: 'Pallet Town',
  genero: 'Masculino',
  campanha: '-',
  classe1: 'Captor',
  level1: 3,
  classe2: 'Colecionador',
  level2: 0,
  classe3: 'Pokebolista',
  level3: 0,
  classe4: 'Engenheiro',
  level4: 0,
  conceito: 'Gotta catch\'em all!',
  avatar: null,
  diasJornada: 6,
  pokedexCount: 10,
  stats: {
    saude: 14,
    ataque: 6,
    defesa: 6,
    atqEspecial: 12,
    defEspecial: 14,
    velocidade: 17,
  },
  hpActual: 64,
  hpMax: 64,
  evasao: {
    fisica: 1,
    especial: 2,
    veloz: 3,
  },
  movimento: {
    terrestre: 14,
    natacao: 4,
    subaquatico: 4,
  },
  talentos: [
    { name: 'No Ponto Fraco!', description: 'Adiciona +1 dano em ataques críticos.' },
    { name: 'Ponto de Captura', description: 'Permite capturar Pokémon com +10% de chance.' },
    { name: 'Galera, Vê Só!', description: 'Concede bônus de moral para a equipe.' }
  ],
  inventario: [
    { id: '1', name: 'Kit de viagens', description: 'Essencial para jornadas longas.', quantity: 1 },
    { id: '2', name: 'Poke Ball', description: '+25 no teste de captura', quantity: 3 }
  ],
  equipe: [
    { id: '1', name: 'Sprigatito', species: 'Sprigatito', ball: 'Poke Ball' },
    { id: '2', name: 'Zigzagoon', species: 'Zigzagoon', ball: 'Poke Ball' }
  ],
  pcBoxes: [
    { id: 1, name: 'Box 1', pokemons: [] }
  ],
  anotacoes: 'Cidade - Borges. Amiga Mãe: Alex. Entregar Pacote para Emilia.',
  skills: DEFAULT_SKILLS, // Inicializa com as perícias padrão
};

export interface PokedexTheme {
  id: string;
  main: string;
  dark: string;
  light: string;
  text: string;
  color: string;
}

export const POKEDEX_THEMES: PokedexTheme[] = [
  { id: 'rose', main: 'bg-rose-600', dark: 'bg-rose-800', light: 'bg-rose-50', text: 'text-rose-600', color: '#e11d48' },
  { id: 'blue', main: 'bg-blue-600', dark: 'bg-blue-800', light: 'bg-blue-50', text: 'text-blue-600', color: '#2563eb' },
  { id: 'emerald', main: 'bg-emerald-600', dark: 'bg-emerald-800', light: 'bg-emerald-50', text: 'text-emerald-600', color: '#059669' },
  { id: 'amber', main: 'bg-amber-600', dark: 'bg-amber-800', light: 'bg-amber-50', text: 'text-amber-600', color: '#d97706' },
  { id: 'slate', main: 'bg-slate-700', dark: 'bg-slate-900', light: 'bg-slate-50', text: 'text-slate-700', color: '#334155' },
];
