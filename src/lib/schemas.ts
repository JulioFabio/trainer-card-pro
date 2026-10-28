import { z } from 'zod';
import { pokemonRecordSchema } from '@/lib/characterModel/schemas';

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
  positionMax: 100_000,
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
    sheetData: z.record(z.string(), z.unknown()).optional(), // sem teto próprio: o corpo é limitado em parse.ts
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
    sheetData: z.record(z.string(), z.unknown()).optional(), // sem teto próprio: o corpo é limitado em parse.ts
  })
  .strict();

// Item: o `ref` (identificador do front) é sempre definido pelo servidor.
export const itemCreateSchema = z
  .object({
    characterId: id,
    name: requiredText(LIMITS.name),
    description: text(LIMITS.description).nullish(),
    quantity: quantity.optional(),
    imageUrl: imageUrl.nullish(),
    position: z.number().int().min(0).max(LIMITS.positionMax).optional(),
  })
  .strict();

export const itemUpdateSchema = z
  .object({
    id,
    name: text(LIMITS.name).optional(),
    description: text(LIMITS.description).nullish(),
    quantity: quantity.optional(),
    imageUrl: imageUrl.nullish(),
    position: z.number().int().min(0).max(LIMITS.positionMax).optional(),
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

// Pokémon: modelo completo e estrito (campos aninhados, golpes, habilidades, atributos).
export const pokemonCreateSchema = pokemonRecordSchema.extend({ characterId: id });

export const pokemonUpdateSchema = pokemonRecordSchema.partial().extend({ id, characterId: id.optional() });

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

// Leitura de Pokémon e de itens: por registro (?id=) ou por ficha (?characterId=), um dos dois.
export const recordQuerySchema = z
  .object({ id: id.optional(), characterId: id.optional() })
  .strict()
  .refine((q) => (q.id === undefined) !== (q.characterId === undefined), {
    error: 'informe id ou characterId, só um dos dois.',
  });

export const tradeListQuerySchema = z.object({ characterId: id }).strict();

export const characterIdSchema = id;
