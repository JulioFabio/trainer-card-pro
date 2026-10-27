import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageExtension = 'png' | 'jpg' | 'webp' | 'gif';

// Pasta física dos uploads. UPLOADS_DIR existe só para os testes: em uso normal os
// arquivos precisam ficar em public/uploads para o Next servi-los em /uploads/...
export function getUploadsRoot(): string {
  return path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'public', 'uploads'));
}

// Identifica a imagem pela assinatura do conteúdo, ignorando nome e tipo declarados.
// SVG, HTML e qualquer outro formato não têm assinatura aceita.
export function detectImageType(buffer: Buffer): ImageExtension | null {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return 'png';
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  if (buffer.length >= 6) {
    const header = buffer.subarray(0, 6).toString('latin1');
    if (header === 'GIF87a' || header === 'GIF89a') return 'gif';
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('latin1') === 'RIFF' &&
    buffer.subarray(8, 12).toString('latin1') === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

// Grava a imagem em <uploads>/<characterId>/<uuid>.<ext>. O nome vem do servidor e o
// caminho resolvido é conferido: nunca pode sair da pasta de uploads.
export async function saveImage(
  characterId: string,
  buffer: Buffer,
  extension: ImageExtension
): Promise<{ url: string; filePath: string }> {
  const root = getUploadsRoot();
  const directory = path.resolve(root, characterId);
  const filename = `${randomUUID()}.${extension}`;
  const filePath = path.resolve(directory, filename);

  if (!filePath.startsWith(root + path.sep)) {
    throw new Error('Caminho de upload fora da pasta permitida.');
  }

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, buffer);

  return { url: `/uploads/${characterId}/${filename}`, filePath };
}
