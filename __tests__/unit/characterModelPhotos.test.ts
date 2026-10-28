import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { detectImageType, MAX_IMAGE_BYTES } from '@/lib/api/imageUpload';
import { CharacterModelError } from '@/lib/characterModel/errors';
import { decomposeSheet } from '@/lib/characterModel/mapper';
import { diskPhotoStore, resolvePhoto, resolvePokemonPhotos, type PhotoContext } from '@/lib/characterModel/photos';
import { makeSheet } from '../helpers/sheetFixture';

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const png = (extra = 'a') => Buffer.concat([PNG_HEADER, Buffer.from(extra)]);
const dataUrl = (buffer: Buffer, mime = 'image/png') => `data:${mime};base64,${buffer.toString('base64')}`;

let dir: string;
let ctx: PhotoContext;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'photos-'));
  ctx = { characterId: 'ficha-1', store: diskPhotoStore(dir), detectImageType, maxBytes: MAX_IMAGE_BYTES };
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const files = async () => (await fs.readdir(path.join(dir, 'ficha-1')).catch(() => [])) as string[];

describe('resolvePhoto', () => {
  it('grava a foto em base64 e devolve o caminho do arquivo', async () => {
    const url = await resolvePhoto(dataUrl(png()), ctx);
    expect(url).toMatch(/^\/uploads\/ficha-1\/[0-9a-f]{64}\.png$/);
    expect(await files()).toHaveLength(1);
    expect(url).not.toContain('base64');
  });

  it('a mesma foto de novo não gera outro arquivo e devolve o mesmo caminho', async () => {
    const first = await resolvePhoto(dataUrl(png()), ctx);
    const second = await resolvePhoto(dataUrl(png()), ctx);
    expect(second).toBe(first);
    expect(await files()).toHaveLength(1);
    await resolvePhoto(dataUrl(png('outra')), ctx);
    expect(await files()).toHaveLength(2);
  });

  it('recusa HTML ou SVG declarado como image/png', async () => {
    const html = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    await expect(resolvePhoto(dataUrl(html), ctx)).rejects.toMatchObject({ status: 400 });
    expect(await files()).toHaveLength(0);
  });

  it('recusa foto com mais de 5 MB com 413', async () => {
    const big = Buffer.concat([PNG_HEADER, Buffer.alloc(MAX_IMAGE_BYTES + 10)]);
    await expect(resolvePhoto(dataUrl(big), ctx)).rejects.toMatchObject({ status: 413 });
    expect(await files()).toHaveLength(0);
  });

  it('aceita caminho de upload, URL http(s) e vazio sem alterar', async () => {
    for (const value of ['', '/uploads/ficha-1/x.png', 'https://exemplo.com/a.png']) {
      expect(await resolvePhoto(value, ctx)).toBe(value);
    }
    expect(await files()).toHaveLength(0);
  });

  it('recusa valores que não são imagem nem caminho, sem repetir o valor', async () => {
    const error = await resolvePhoto('javascript:alert(1)', ctx).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CharacterModelError);
    expect((error as Error).message).not.toContain('javascript');
    await expect(resolvePhoto('data:image/png;base64,@@@@', ctx)).rejects.toMatchObject({ status: 400 });
  });
});

describe('resolvePokemonPhotos', () => {
  it('troca as fotos das linhas e reaproveita a mesma imagem entre Pokémon', async () => {
    const sheet = makeSheet();
    const photo = dataUrl(png('foto'));
    sheet.pcBoxes[0].pokemons[0].imageUrl = photo;
    sheet.pcBoxes[0].pokemons[1].imageUrl = photo;
    const rows = decomposeSheet(sheet as unknown as Record<string, unknown>);
    await resolvePokemonPhotos(rows.pokemons, ctx);
    const urls = rows.pokemons.map((p) => p.imageUrl).filter(Boolean);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toBe(urls[1]);
    expect(await files()).toHaveLength(1);
  });
});
