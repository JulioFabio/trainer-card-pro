
import { TrainerData } from './types';

export const BASE_POINTS = 66;
export const MAX_STAT_INITIAL = 14;

export const STAT_LABELS: Record<string, string> = {
  saude: 'Saúde',
  ataque: 'Ataque',
  defesa: 'Defesa',
  atqEspecial: 'Atq. Esp',
  defEspecial: 'Def. Esp',
  velocidade: 'Velocidade',
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
  nomePersonagem: '',
  jogador: '',
  levelGeral: 1,
  idade: 0,
  peso: '',
  altura: '',
  naturalidade: '',
  genero: '',
  campanha: '',
  classe1: '',
  level1: 0,
  classe2: '',
  level2: 0,
  classe3: '',
  level3: 0,
  classe4: '',
  level4: 0,
  conceito: '',
  avatar: null,
  diasJornada: 0,
  pokedexCount: 0,
  stats: {
    saude: 0,
    ataque: 0,
    defesa: 0,
    atqEspecial: 0,
    defEspecial: 0,
    velocidade: 0,
  },
  hpActual: 0,
  talentos: [],
  inventario: [],
  equipe: [],
  pcBoxes: Array.from({ length: 99 }, (_, i) => ({ id: i + 1, name: `Box ${i + 1}`, pokemons: [] })),
  anotacoes: '',
  skills: DEFAULT_SKILLS,
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
