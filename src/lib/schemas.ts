import { z } from 'zod';

// Limites da API (spec request-validation).
export const LIMITS = {
  name: 100,
  description: 2000,
  noteContent: 100_000,
  url: 2048,
  levelMin: 1,
  levelMax: 100,
  moneyMax: 1_000_000_000,
  quantityMax: 9_999,
  sheetDataBytes: 8 * 1024 * 1024, // as fotos dos Pokémon ainda ficam embutidas (fase 4 as tira)
  pokemonDataBytes: 1024 * 1024,
  tradeDataBytes: 1024 * 1024,
} as const;

export const TOO_LARGE_FLAG = 'tooLarge';

const id = z.uuid();

const text = (max: number) => z.string().max(max);
const requiredText = (max: number) => z.string().min(1).max(max);

// Vazio, caminho de upload ou http(s). Bloqueia javascript:, data: e afins.
const imageUrl = z
  .string()
  .max(LIMITS.url)
  .refine(
    (value) => value === '' || value.startsWith('/uploads/') || /^https?:\/\//i.test(value),
    { error: 'deve ser vazio, um caminho /uploads/ ou um endereço http(s).' }
  );

// Conteúdo opaco até a fase 4: precisa ser um objeto e caber no limite serializado.
const jsonObject = (maxBytes: number) =>
  z.record(z.string(), z.unknown()).refine((value) => JSON.stringify(value).length <= maxBytes, {
    error: 'excede o tamanho máximo permitido.',
    params: { [TOO_LARGE_FLAG]: true },
  });

const level = z.number().int().min(LIMITS.levelMin).max(LIMITS.levelMax);
const money = z.number().int().min(0).max(LIMITS.moneyMax);
const quantity = z.number().int().min(0).max(LIMITS.quantityMax);

// ── Corpo das requisições ─────────────────────────────────────────────

export const characterCreateSchema = z
  .object({
    name: requiredText(LIMITS.name),
    level: level.optional(),
    money: money.optional(),
    avatarUrl: imageUrl.nullish(),
    sheetData: jsonObject(LIMITS.sheetDataBytes).optional(),
  })
  .strict();

export const characterUpdateSchema = z
  .object({
    id,
    // Vazio significa "sem mudança", como o front já enviava.
    name: text(LIMITS.name).optional(),
    level: level.optional(),
    money: money.optional(),
    avatarUrl: imageUrl.nullish(),
    sheetData: jsonObject(LIMITS.sheetDataBytes).optional(),
  })
  .strict();

export const itemCreateSchema = z
  .object({
    characterId: id,
    name: requiredText(LIMITS.name),
    description: text(LIMITS.description).nullish(),
    quantity: quantity.optional(),
    imageUrl: imageUrl.nullish(),
  })
  .strict();

export const itemUpdateSchema = z
  .object({
    id,
    name: text(LIMITS.name).optional(),
    description: text(LIMITS.description).nullish(),
    quantity: quantity.optional(),
    imageUrl: imageUrl.nullish(),
    characterId: id.optional(),
  })
  .strict();

export const noteCreateSchema = z
  .object({
    characterId: id,
    title: requiredText(LIMITS.name),
    content: text(LIMITS.noteContent).optional(),
  })
  .strict();

export const noteUpdateSchema = z
  .object({
    id,
    title: text(LIMITS.name).optional(),
    content: text(LIMITS.noteContent).optional(),
  })
  .strict();

export const pokemonCreateSchema = z
  .object({
    characterId: id,
    nickname: requiredText(LIMITS.name),
    species: requiredText(LIMITS.name),
    isParty: z.boolean().optional(),
    boxName: text(LIMITS.name).nullish(),
    imageUrl: imageUrl.nullish(),
    pokemonData: jsonObject(LIMITS.pokemonDataBytes).optional(),
  })
  .strict();

export const pokemonUpdateSchema = z
  .object({
    id,
    nickname: text(LIMITS.name).optional(),
    species: text(LIMITS.name).optional(),
    isParty: z.boolean().optional(),
    boxName: text(LIMITS.name).nullish(),
    imageUrl: imageUrl.nullish(),
    pokemonData: jsonObject(LIMITS.pokemonDataBytes).optional(),
    characterId: id.optional(),
  })
  .strict();

export const tradeCreateSchema = z
  .object({
    senderId: id,
    receiverId: id,
    tradeData: jsonObject(LIMITS.tradeDataBytes).optional(),
  })
  .strict();

export const tradeRespondSchema = z
  .object({
    id,
    status: z.enum(['ACCEPTED', 'REJECTED']),
  })
  .strict();

// ── Parâmetros de consulta ────────────────────────────────────────────

export const characterQuerySchema = z
  .object({
    id: id.optional(),
    scope: z.literal('all').optional(),
  })
  .strict();

export const idQuerySchema = z.object({ id }).strict();

export const tradeListQuerySchema = z.object({ characterId: id }).strict();

export const characterIdSchema = id;
