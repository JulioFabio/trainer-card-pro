import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CharacterModelError } from './errors.ts';
import type { PokemonRow } from './mapper.ts';

// Fotos em base64 viram arquivos em <uploads>/<ficha>/<hash>.<ext>. Este módulo não importa
// '@/...': o detector de imagem da fase 3 entra por injeção.

export interface PhotoStore {
  /** Grava o arquivo (se ainda não existe) e devolve o caminho público /uploads/<ficha>/<nome>. */
  save(characterId: string, filename: string, data: Buffer): Promise<string>;
}

export type DetectImageType = (buffer: Buffer) => string | null;

export interface PhotoContext {
  characterId: string;
  store: PhotoStore;
  detectImageType: DetectImageType;
  maxBytes: number;
}

const DATA_URL = /^data:image\/[a-z0-9.+-]+;base64,/i;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

export function diskPhotoStore(uploadsRoot: string): PhotoStore {
  const root = path.resolve(uploadsRoot);
  return {
    async save(characterId, filename, data) {
      const directory = path.resolve(root, characterId);
      const filePath = path.resolve(directory, filename);
      if (!filePath.startsWith(root + path.sep)) {
        throw new CharacterModelError('Caminho de foto fora da pasta permitida.');
      }
      await fs.mkdir(directory, { recursive: true });
      try {
        // 'wx' não regrava: a mesma imagem (mesmo hash) já está lá.
        await fs.writeFile(filePath, data, { flag: 'wx' });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
      return `/uploads/${characterId}/${filename}`;
    },
  };
}

/** Devolve o valor que deve ser guardado: caminho/URL como veio, ou o caminho do arquivo gravado. */
export async function resolvePhoto(value: string, ctx: PhotoContext): Promise<string> {
  if (value === '' || value.startsWith('/uploads/') || /^https?:\/\//i.test(value)) return value;
  if (!DATA_URL.test(value)) {
    throw new CharacterModelError('Foto inválida: use um caminho /uploads/, um endereço http(s) ou uma imagem.');
  }

  const base64 = value.slice(value.indexOf(',') + 1);
  if (Math.floor((base64.length * 3) / 4) > ctx.maxBytes + 3) {
    throw new CharacterModelError('Foto grande demais.', 413);
  }
  if (!BASE64.test(base64)) throw new CharacterModelError('Foto inválida: base64 malformado.');

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > ctx.maxBytes) throw new CharacterModelError('Foto grande demais.', 413);

  const extension = ctx.detectImageType(buffer);
  if (!extension) throw new CharacterModelError('Foto inválida: só PNG, JPEG, WebP e GIF são aceitos.');

  const hash = createHash('sha256').update(buffer).digest('hex');
  return ctx.store.save(ctx.characterId, `${hash}.${extension}`, buffer);
}

/** Troca, nas linhas dos Pokémon, cada foto em base64 pelo caminho do arquivo gravado. */
export async function resolvePokemonPhotos(pokemons: PokemonRow[], ctx: PhotoContext): Promise<void> {
  const done = new Map<string, string>();
  for (const pokemon of pokemons) {
    const value = pokemon.imageUrl;
    if (value === null || value === undefined) continue;
    let resolved = done.get(value);
    if (resolved === undefined) {
      resolved = await resolvePhoto(value, ctx);
      done.set(value, resolved);
    }
    pokemon.imageUrl = resolved;
  }
}
