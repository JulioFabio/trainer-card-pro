import { prisma } from '@/lib/prisma';
import { CharacterModelError } from '@/lib/characterModel/errors';
import { diskPhotoStore } from '@/lib/characterModel/photos';
import type { StoreDeps } from '@/lib/characterModel/store';
import { HttpError } from '@/lib/api/errors';
import { detectImageType, getUploadsRoot, MAX_IMAGE_BYTES } from '@/lib/api/imageUpload';

// Liga o armazenamento da ficha (src/lib/characterModel) ao Prisma e à pasta de uploads reais.
export function modelDeps(): StoreDeps {
  return {
    prisma,
    photos: { store: diskPhotoStore(getUploadsRoot()), detectImageType, maxBytes: MAX_IMAGE_BYTES },
  };
}

// Converte os erros de regra da ficha na resposta HTTP correspondente (400, 409 ou 413).
export async function modelCall<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof CharacterModelError) throw new HttpError(error.status, error.message);
    throw error;
  }
}
