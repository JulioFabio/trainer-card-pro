import type { PCBox, StoredPokemon, TrainerData } from '@/types';
import { CharacterModelError } from './errors.ts';
import {
  MODEL_LIMITS,
  REF_PATTERN,
  STAT_KEYS,
  itemSchema,
  pcBoxSchema,
  talentSchema,
  type StoredPokemonInput,
} from './schemas.ts';

// Funções puras: ficha no formato do front <-> linhas planas das tabelas.

type StatBlock = Record<(typeof STAT_KEYS)[number], number>;

export interface PokemonRow {
  ref: string;
  boxNumber: number;
  slot: number;
  partySlot: number | null;
  nickname: string;
  species: string;
  level: number;
  gender: string;
  ball: string;
  imageUrl: string | null;
  nature: string;
  natureFeatures: string;
  elementalDamageBonus: number;
  traitName: string;
  traitDescription: string;
  hpCurrent: number;
  hpMax: number;
  evasionPhysical: number;
  evasionSpecial: number;
  evasionSpeed: number;
  moveLand: number;
  moveFly: number;
  moveSwim: number;
  moveUnderwater: number;
  moveBurrow: number;
  forceValue: number;
  forceDescription: string;
  intelligenceValue: number;
  intelligenceDescription: string;
  jumpValue: number;
  jumpDescription: string;
  types: { position: number; type: string }[];
  abilities: { position: number; name: string; description: string }[];
  moves: {
    position: number;
    ref: string;
    name: string;
    type: string;
    category: string;
    frequency: string;
    range: string;
    damage: string;
    accuracy: string;
    descriptor: string;
    description: string;
  }[];
  capabilities: { position: number; name: string; value: string }[];
  stats: ({ kind: string } & StatBlock)[];
}

export interface ItemRow {
  ref: string;
  position: number;
  name: string;
  description: string;
  quantity: number;
  imageUrl: string | null;
}

export interface TalentRow {
  position: number;
  name: string;
  description: string;
}

export interface BoxRow {
  number: number;
  name: string;
}

export interface DecomposedSheet {
  /** sheetData sem inventario, talentos, equipe e pcBoxes. */
  reduced: Record<string, unknown>;
  pokemons: PokemonRow[];
  items: ItemRow[];
  talents: TalentRow[];
  /** Só as caixas com nome diferente de "Box N". */
  boxes: BoxRow[];
  /**
   * Quais coleções a ficha recebida traz. Uma lista ausente significa "não mexer", para que
   * um sheetData reduzido nunca apague Pokémon, itens ou talentos já guardados.
   */
  touches: { pokemons: boolean; items: boolean; talents: boolean };
}

export interface SheetRows {
  pokemons: PokemonRow[];
  items: ItemRow[];
  talents: TalentRow[];
  boxes: BoxRow[];
}

export const LIST_KEYS = ['inventario', 'talentos', 'equipe', 'pcBoxes'] as const;

export const defaultBoxName = (number: number) => `Box ${number}`;

export function hasLegacyLists(sheet: Record<string, unknown>): boolean {
  return LIST_KEYS.some((key) => key in sheet);
}

function fail(message: string): never {
  throw new CharacterModelError(message);
}

function checkRef(ref: string, what: string): void {
  if (ref.length === 0 || ref.length > MODEL_LIMITS.refMax || !REF_PATTERN.test(ref)) {
    fail(`${what}: identificador inválido.`);
  }
}

function formatIssues(prefix: string, error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  const issue = error.issues[0];
  const path = [prefix, ...issue.path.map(String)].join('.');
  return `${path}: ${issue.message}`;
}

// ── Ficha -> linhas ───────────────────────────────────────────────────

export function toPokemonRow(pokemon: StoredPokemonInput, boxNumber: number, partySlot: number | null): PokemonRow {
  const { stats, capabilities } = pokemon;
  const statRow = (kind: string, block: StatBlock) => ({ kind, ...pickStats(block) });
  const moveRefs = new Set<string>();

  return {
    ref: pokemon.id,
    boxNumber,
    slot: pokemon.slot,
    partySlot,
    nickname: pokemon.name,
    species: pokemon.species,
    level: pokemon.level,
    gender: pokemon.gender,
    ball: pokemon.ball,
    imageUrl: pokemon.imageUrl ?? null,
    nature: pokemon.nature,
    natureFeatures: pokemon.natureFeatures,
    elementalDamageBonus: pokemon.elementalDamageBonus,
    traitName: pokemon.capabilityTrait.name,
    traitDescription: pokemon.capabilityTrait.description,
    hpCurrent: pokemon.hp.current,
    hpMax: pokemon.hp.max,
    evasionPhysical: pokemon.evasions.fisica,
    evasionSpecial: pokemon.evasions.especial,
    evasionSpeed: pokemon.evasions.veloz,
    moveLand: pokemon.movements.terrestre,
    moveFly: pokemon.movements.voo,
    moveSwim: pokemon.movements.natacao,
    moveUnderwater: pokemon.movements.subaquatico,
    moveBurrow: pokemon.movements.escavacao,
    forceValue: capabilities.force.value,
    forceDescription: capabilities.force.description,
    intelligenceValue: capabilities.intelligence.value,
    intelligenceDescription: capabilities.intelligence.description,
    jumpValue: capabilities.jump.value,
    jumpDescription: capabilities.jump.description,
    types: pokemon.types.map((type, position) => ({ position, type })),
    abilities: pokemon.abilities.map((a, position) => ({ position, name: a.name, description: a.description })),
    moves: pokemon.moves.map((move, position) => {
      // O front usa o índice como id do golpe e pode deixá-lo vazio.
      const ref = move.id === '' ? String(position) : move.id;
      checkRef(ref, `Pokémon ${pokemon.id}, golpe ${position + 1}`);
      if (moveRefs.has(ref)) fail(`Pokémon ${pokemon.id}: golpe com identificador repetido.`);
      moveRefs.add(ref);
      return { position, ref, ...omitId(move) };
    }),
    capabilities: capabilities.other.map((c, position) => ({ position, name: c.name, value: c.value })),
    stats: [statRow('total', stats), statRow('base', stats.base), statRow('lvl', stats.lvl)],
  };
}

function pickStats(block: StatBlock): StatBlock {
  return {
    saude: block.saude,
    ataque: block.ataque,
    defesa: block.defesa,
    atqEspecial: block.atqEspecial,
    defEspecial: block.defEspecial,
    velocidade: block.velocidade,
  };
}

function omitId<T extends { id: string }>(value: T): Omit<T, 'id'> {
  const { id: _id, ...rest } = value;
  void _id;
  return rest;
}

/**
 * Valida o `sheetData` recebido (esquema tolerante e regras de integridade) e o divide em
 * `reduced` mais as linhas das tabelas. Não toca em fotos: `imageUrl` segue como chegou.
 */
export function decomposeSheet(sheet: Record<string, unknown>): DecomposedSheet {
  const reduced: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sheet)) {
    if (!(LIST_KEYS as readonly string[]).includes(key)) reduced[key] = value;
  }

  const rawBoxes = asList(sheet.pcBoxes, 'pcBoxes');
  const rawItems = asList(sheet.inventario, 'inventario');
  const rawTalents = asList(sheet.talentos, 'talentos');
  const rawParty = asList(sheet.equipe, 'equipe');

  if (rawItems.length > MODEL_LIMITS.itemsPerCharacter) {
    fail(`inventario: no máximo ${MODEL_LIMITS.itemsPerCharacter} itens.`);
  }
  if (rawTalents.length > MODEL_LIMITS.talentsPerCharacter) {
    fail(`talentos: no máximo ${MODEL_LIMITS.talentsPerCharacter} talentos.`);
  }

  // Caixas e Pokémon
  const boxSchema = pcBoxSchema('tolerant');
  const seenBoxes = new Set<number>();
  const pokemons: PokemonRow[] = [];
  const boxes: BoxRow[] = [];
  const refs = new Set<string>();
  const positions = new Set<string>();

  rawBoxes.forEach((rawBox, index) => {
    const parsed = boxSchema.safeParse(rawBox);
    if (!parsed.success) fail(formatIssues(`pcBoxes.${index}`, parsed.error));
    const box = parsed.data;
    if (seenBoxes.has(box.id)) fail(`pcBoxes: caixa ${box.id} repetida.`);
    seenBoxes.add(box.id);
    if (box.name !== defaultBoxName(box.id)) boxes.push({ number: box.id, name: box.name });

    for (const pokemon of box.pokemons) {
      checkRef(pokemon.id, `Pokémon da caixa ${box.id}`);
      if (refs.has(pokemon.id)) fail(`Pokémon ${pokemon.id}: identificador repetido.`);
      refs.add(pokemon.id);
      const where = `${box.id}:${pokemon.slot}`;
      if (positions.has(where)) fail(`Caixa ${box.id}: duas posições iguais (${pokemon.slot}).`);
      positions.add(where);
      pokemons.push(toPokemonRow(pokemon, box.id, null));
    }
    if (pokemons.length > MODEL_LIMITS.pokemonPerCharacter) {
      fail(`pcBoxes: no máximo ${MODEL_LIMITS.pokemonPerCharacter} Pokémon por ficha.`);
    }
  });

  // Equipe: ids sem Pokémon e repetidos saem; mais de 6 é erro.
  const party: string[] = [];
  for (const id of rawParty) {
    if (typeof id !== 'string' || !refs.has(id) || party.includes(id)) continue;
    party.push(id);
  }
  if (party.length > MODEL_LIMITS.partySize) fail(`equipe: no máximo ${MODEL_LIMITS.partySize} Pokémon.`);
  const byRef = new Map(pokemons.map((row) => [row.ref, row]));
  party.forEach((id, slot) => {
    byRef.get(id)!.partySlot = slot;
  });

  // Itens e talentos
  const itemParser = itemSchema('tolerant');
  const itemRefs = new Set<string>();
  const items = rawItems.map((raw, position): ItemRow => {
    const parsed = itemParser.safeParse(raw);
    if (!parsed.success) fail(formatIssues(`inventario.${position}`, parsed.error));
    const item = parsed.data;
    checkRef(item.id, `Item ${position + 1}`);
    if (itemRefs.has(item.id)) fail(`Item ${item.id}: identificador repetido.`);
    itemRefs.add(item.id);
    return {
      ref: item.id,
      position,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      imageUrl: item.imageUrl ?? null,
    };
  });

  const talentParser = talentSchema('tolerant');
  const talents = rawTalents.map((raw, position): TalentRow => {
    const parsed = talentParser.safeParse(raw);
    if (!parsed.success) fail(formatIssues(`talentos.${position}`, parsed.error));
    return { position, name: parsed.data.name, description: parsed.data.description };
  });

  return {
    reduced,
    pokemons,
    items,
    talents,
    boxes,
    touches: {
      pokemons: Array.isArray(sheet.pcBoxes),
      items: Array.isArray(sheet.inventario),
      talents: Array.isArray(sheet.talentos),
    },
  };
}

function asList(value: unknown, key: string): unknown[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) fail(`${key}: deve ser uma lista.`);
  return value;
}

// ── Linhas -> ficha ───────────────────────────────────────────────────

const byPosition = <T extends { position: number }>(list: T[]) => [...list].sort((a, b) => a.position - b.position);

export function fromPokemonRow(row: PokemonRow): StoredPokemon {
  const stat = (kind: string): StatBlock => {
    const found = row.stats.find((s) => s.kind === kind);
    return found ? pickStats(found) : pickStats({ saude: 0, ataque: 0, defesa: 0, atqEspecial: 0, defEspecial: 0, velocidade: 0 });
  };

  const pokemon: StoredPokemon = {
    id: row.ref,
    name: row.nickname,
    species: row.species,
    level: row.level,
    gender: row.gender as StoredPokemon['gender'],
    types: byPosition(row.types).map((t) => t.type),
    ball: row.ball,
    slot: row.slot,
    nature: row.nature,
    natureFeatures: row.natureFeatures,
    elementalDamageBonus: row.elementalDamageBonus,
    capabilityTrait: { name: row.traitName, description: row.traitDescription },
    abilities: byPosition(row.abilities).map((a) => ({ name: a.name, description: a.description })),
    stats: { ...stat('total'), base: stat('base'), lvl: stat('lvl') },
    hp: { current: row.hpCurrent, max: row.hpMax },
    evasions: { fisica: row.evasionPhysical, especial: row.evasionSpecial, veloz: row.evasionSpeed },
    movements: {
      terrestre: row.moveLand,
      voo: row.moveFly,
      natacao: row.moveSwim,
      subaquatico: row.moveUnderwater,
      escavacao: row.moveBurrow,
    },
    capabilities: {
      force: { value: row.forceValue, description: row.forceDescription },
      intelligence: { value: row.intelligenceValue, description: row.intelligenceDescription },
      jump: { value: row.jumpValue, description: row.jumpDescription },
      other: byPosition(row.capabilities).map((c) => ({ name: c.name, value: c.value })),
    },
    moves: byPosition(row.moves).map((m) => ({
      id: m.ref,
      name: m.name,
      type: m.type,
      category: m.category as StoredPokemon['moves'][number]['category'],
      frequency: m.frequency,
      range: m.range,
      damage: m.damage,
      accuracy: m.accuracy,
      descriptor: m.descriptor,
      description: m.description,
    })),
  };
  if (row.imageUrl !== null) pokemon.imageUrl = row.imageUrl;
  return pokemon;
}

/** Ficha no formato do front: `reduced` mais as listas montadas das tabelas, em ordem estável. */
export function assembleSheet(reduced: Record<string, unknown>, rows: SheetRows): TrainerData {
  const names = new Map(rows.boxes.map((b) => [b.number, b.name]));
  const inBox = new Map<number, PokemonRow[]>();
  for (const row of rows.pokemons) {
    const list = inBox.get(row.boxNumber) ?? [];
    list.push(row);
    inBox.set(row.boxNumber, list);
  }

  const pcBoxes: PCBox[] = Array.from({ length: MODEL_LIMITS.boxes }, (_, i) => {
    const id = i + 1;
    const pokemons = (inBox.get(id) ?? []).sort((a, b) => a.slot - b.slot).map(fromPokemonRow);
    return { id, name: names.get(id) ?? defaultBoxName(id), pokemons };
  });

  const equipe = rows.pokemons
    .filter((row) => row.partySlot !== null)
    .sort((a, b) => a.partySlot! - b.partySlot!)
    .map((row) => row.ref);

  return {
    ...reduced,
    inventario: byPosition(rows.items).map((item) => {
      const out: TrainerData['inventario'][number] & { imageUrl?: string } = {
        id: item.ref,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
      };
      if (item.imageUrl !== null) out.imageUrl = item.imageUrl;
      return out;
    }),
    talentos: byPosition(rows.talents).map((t) => ({ name: t.name, description: t.description })),
    equipe,
    pcBoxes,
  } as TrainerData;
}

/** JSON com chaves em ordem fixa, para comparar o que veio com o que está guardado. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : 1)));
    }
    return v;
  });
}
