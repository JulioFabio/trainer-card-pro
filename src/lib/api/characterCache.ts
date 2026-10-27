import { memoryCache } from '@/lib/cache';

export const characterCacheKey = (id: string) => `character:${id}`;

// Toda escrita em ficha, item, nota ou Pokémon invalida a leitura em cache da ficha,
// para a próxima leitura já refletir a mudança.
export function invalidateCharacter(characterId: string): void {
  memoryCache.delete(characterCacheKey(characterId));
}
