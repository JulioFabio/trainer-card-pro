import { z } from 'zod';

// Este módulo não importa '@/...' para poder rodar no Node puro (scripts/seed-dev.ts).

export const MODEL_LIMITS = {
  pokemonPerCharacter: 3_000,
  itemsPerCharacter: 500,
  talentsPerCharacter: 200,
  movesPerPokemon: 50,
  abilitiesPerPokemon: 10,
  typesPerPokemon: 3,
  extraCapabilitiesPerPokemon: 30,
  boxes: 99,
  boxSlots: 30,
  partySize: 6,
  refMax: 64,
  name: 100,
  short: 200,
  description: 2_000,
  url: 2_048,
  photoDataUrl: 7_500_000, // 5 MB de imagem em base64
  statMax: 999,
  hpMax: 99_999,
  quantityMax: 9_999,
} as const;

export const REF_PATTERN = /^[A-Za-z0-9_-]+$/;
export const GENDERS = ['M', 'F', 'U'] as const;
export const MOVE_CATEGORIES = ['Físico', 'Especial', 'Status'] as const;
export const STAT_KEYS = ['saude', 'ataque', 'defesa', 'atqEspecial', 'defEspecial', 'velocidade'] as const;

/**
 * 'strict' é para as rotas granulares: tudo obrigatório, campo desconhecido é erro.
 * 'tolerant' é para a fachada de /api/character: ignora campo desconhecido, completa
 * o que falta e arredonda/limita números, para não recusar o que o front envia hoje.
 */
export type Mode = 'strict' | 'tolerant';

const tooLong = (ctx: z.core.ParsePayload, input: unknown, max: number) => {
  ctx.issues.push({ code: 'custom', message: `deve ter no máximo ${max} caracteres.`, input });
  return z.NEVER;
};

function int(mode: Mode, min: number, max: number, def: number): z.ZodType<number> {
  if (mode === 'strict') return z.number().int().min(min).max(max);
  return z
    .unknown()
    .transform((value) => {
      if (typeof value !== 'number' || !Number.isFinite(value)) return def;
      return Math.min(max, Math.max(min, Math.round(value)));
    })
    .default(def);
}

function str(mode: Mode, max: number, def = ''): z.ZodType<string> {
  if (mode === 'strict') return z.string().max(max);
  return z
    .unknown()
    .transform((value, ctx) => {
      if (typeof value !== 'string') return def;
      return value.length > max ? tooLong(ctx, value, max) : value;
    })
    .default(def);
}

function oneOf<const T extends readonly [string, ...string[]]>(
  mode: Mode,
  values: T,
  def: T[number]
): z.ZodType<T[number]> {
  const schema = z.enum(values);
  return mode === 'strict' ? schema : schema.default(def);
}

function list<S extends z.ZodType>(mode: Mode, item: S, max: number): z.ZodType<z.output<S>[]> {
  const schema = z.array(item).max(max);
  return mode === 'strict' ? schema : schema.default([]);
}

// Na fachada o id pode vir como número ou faltar; o mapper recusa o que ficar vazio.
const looseRef = z
  .unknown()
  .transform((v) => (v === undefined || v === null ? '' : String(v)))
  .default('');

// Identificador do front (Date.now()) ou do golpe (índice): letras, números, hífen e sublinhado.
export const refSchema = z
  .string()
  .min(1)
  .max(MODEL_LIMITS.refMax)
  .regex(REF_PATTERN, { error: 'deve ter só letras, números, hífen e sublinhado.' });

// Vazio, caminho de upload ou http(s). Nunca javascript: nem data:.
export const imagePathSchema = z
  .string()
  .max(MODEL_LIMITS.url)
  .refine((v) => v === '' || v.startsWith('/uploads/') || /^https?:\/\//i.test(v), {
    error: 'deve ser vazio, um caminho /uploads/ ou um endereço http(s).',
  });

// Na fachada, a foto também pode chegar em base64; photos.ts a valida e a troca por um caminho.
const photoSchema = z
  .string()
  .max(MODEL_LIMITS.photoDataUrl)
  .refine((v) => v === '' || v.startsWith('/uploads/') || /^https?:\/\//i.test(v) || v.startsWith('data:image/'), {
    error: 'deve ser vazio, um caminho /uploads/, um endereço http(s) ou uma imagem em base64.',
  });

// Na fachada, objeto ausente vira objeto com os padrões de cada campo (prefault).
function obj<T extends z.core.$ZodShape>(mode: Mode, shape: T) {
  return mode === 'strict' ? z.strictObject(shape) : z.object(shape).prefault({} as never);
}

function statsShape(mode: Mode) {
  return Object.fromEntries(
    STAT_KEYS.map((key) => [key, int(mode, 0, MODEL_LIMITS.statMax, 0)])
  ) as Record<(typeof STAT_KEYS)[number], z.ZodType<number>>;
}

const statsBlock = (mode: Mode) => obj(mode, statsShape(mode));

function moveSchema(mode: Mode) {
  return obj(mode, {
    id: mode === 'strict' ? refSchema : looseRef,
    name: str(mode, MODEL_LIMITS.name),
    type: str(mode, MODEL_LIMITS.short),
    category: oneOf(mode, MOVE_CATEGORIES, 'Físico'),
    frequency: str(mode, MODEL_LIMITS.short),
    range: str(mode, MODEL_LIMITS.short),
    damage: str(mode, MODEL_LIMITS.short),
    accuracy: str(mode, MODEL_LIMITS.short),
    descriptor: str(mode, MODEL_LIMITS.short),
    description: str(mode, MODEL_LIMITS.description),
  });
}

function namedDescription(mode: Mode) {
  return obj(mode, {
    name: str(mode, MODEL_LIMITS.name),
    description: str(mode, MODEL_LIMITS.description),
  });
}

function capabilityValue(mode: Mode) {
  return obj(mode, {
    value: int(mode, 0, MODEL_LIMITS.statMax, 0),
    description: str(mode, MODEL_LIMITS.description),
  });
}

/** Tudo do Pokémon, menos identificação e posição. */
function pokemonCoreShape(mode: Mode, photo: z.ZodType<string>) {
  const optionalPhoto = mode === 'strict' ? photo.optional() : photo.optional().catch(undefined);
  return {
    name: str(mode, MODEL_LIMITS.name),
    species: str(mode, MODEL_LIMITS.name),
    level: int(mode, 1, 100, 1),
    gender: oneOf(mode, GENDERS, 'U'),
    types: list(mode, z.string().max(MODEL_LIMITS.name), MODEL_LIMITS.typesPerPokemon),
    ball: str(mode, MODEL_LIMITS.name),
    imageUrl: optionalPhoto,
    nature: str(mode, MODEL_LIMITS.name),
    natureFeatures: str(mode, MODEL_LIMITS.short),
    elementalDamageBonus: int(mode, -999, 999, 0),
    capabilityTrait: namedDescription(mode),
    abilities: list(mode, namedDescription(mode), MODEL_LIMITS.abilitiesPerPokemon),
    stats: obj(mode, {
      ...statsShape(mode),
      base: statsBlock(mode),
      lvl: statsBlock(mode),
    }),
    hp: obj(mode, {
      current: int(mode, 0, MODEL_LIMITS.hpMax, 0),
      max: int(mode, 0, MODEL_LIMITS.hpMax, 0),
    }),
    evasions: obj(mode, {
      fisica: int(mode, 0, MODEL_LIMITS.statMax, 0),
      especial: int(mode, 0, MODEL_LIMITS.statMax, 0),
      veloz: int(mode, 0, MODEL_LIMITS.statMax, 0),
    }),
    movements: obj(mode, {
      terrestre: int(mode, 0, MODEL_LIMITS.statMax, 0),
      voo: int(mode, 0, MODEL_LIMITS.statMax, 0),
      natacao: int(mode, 0, MODEL_LIMITS.statMax, 0),
      subaquatico: int(mode, 0, MODEL_LIMITS.statMax, 0),
      escavacao: int(mode, 0, MODEL_LIMITS.statMax, 0),
    }),
    capabilities: obj(mode, {
      force: capabilityValue(mode),
      intelligence: capabilityValue(mode),
      jump: capabilityValue(mode),
      other: list(
        mode,
        obj(mode, { name: str(mode, MODEL_LIMITS.name), value: str(mode, MODEL_LIMITS.short) }),
        MODEL_LIMITS.extraCapabilitiesPerPokemon
      ),
    }),
    moves: list(mode, moveSchema(mode), MODEL_LIMITS.movesPerPokemon),
  };
}

const slotIndex = (mode: Mode) => int(mode, 0, MODEL_LIMITS.boxSlots - 1, 0);
const boxNumber = (mode: Mode) => int(mode, 1, MODEL_LIMITS.boxes, 1);
const partySlot = int('strict', 0, MODEL_LIMITS.partySize - 1, 0);

/** Pokémon no formato do front (`StoredPokemon`): `id` é o `ref`, `slot` é a posição na caixa. */
export function storedPokemonSchema(mode: Mode) {
  return obj(mode, {
    id: mode === 'strict' ? refSchema : looseRef,
    slot: slotIndex(mode),
    ...pokemonCoreShape(mode, mode === 'strict' ? imagePathSchema : photoSchema),
  });
}

/** Corpo das rotas granulares: o Pokémon com a caixa e a posição onde mora. */
export const pokemonRecordSchema = z.strictObject({
  ...pokemonCoreShape('strict', imagePathSchema),
  boxNumber: boxNumber('strict'),
  slot: slotIndex('strict'),
  partySlot: partySlot.nullable().optional(),
});

export function itemSchema(mode: Mode) {
  const url = mode === 'strict' ? imagePathSchema.optional() : imagePathSchema.optional().catch(undefined);
  return obj(mode, {
    id: mode === 'strict' ? refSchema : looseRef,
    name: str(mode, MODEL_LIMITS.name),
    description: str(mode, MODEL_LIMITS.description),
    quantity: int(mode, 0, MODEL_LIMITS.quantityMax, 1),
    imageUrl: url,
  });
}

export function talentSchema(mode: Mode) {
  return namedDescription(mode);
}

export function pcBoxSchema(mode: Mode) {
  return obj(mode, {
    id: boxNumber(mode),
    name: str(mode, MODEL_LIMITS.name),
    pokemons: list(mode, storedPokemonSchema(mode), MODEL_LIMITS.boxSlots),
  });
}

export type StoredPokemonInput = z.output<ReturnType<typeof storedPokemonSchema>>;
export type PokemonRecordInput = z.output<typeof pokemonRecordSchema>;
export type ItemInput = z.output<ReturnType<typeof itemSchema>>;
export type TalentInput = z.output<ReturnType<typeof talentSchema>>;
export type PcBoxInput = z.output<ReturnType<typeof pcBoxSchema>>;
