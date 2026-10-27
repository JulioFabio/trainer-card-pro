import { logger } from './telemetry';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

export const memoryCache = {
  get<T>(key: string): T | null {
    const entry = cacheStore.get(key);
    
    if (!entry) {
      logger.debug(`Cache MISS`, {
        component: 'Cache',
        action: 'GET',
        key,
        status: 'MISS',
      });
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      cacheStore.delete(key);
      logger.debug(`Cache MISS (Expired)`, {
        component: 'Cache',
        action: 'GET',
        key,
        status: 'EXPIRED',
      });
      return null;
    }

    logger.debug(`Cache HIT`, {
      component: 'Cache',
      action: 'GET',
      key,
      status: 'HIT',
    });
    
    return entry.value as T;
  },

  set(key: string, value: any, ttlMs: number = 10000): void {
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    
    logger.debug(`Cache SET`, {
      component: 'Cache',
      action: 'SET',
      key,
      ttlMs,
    });
  },

  delete(key: string): void {
    const existed = cacheStore.has(key);
    cacheStore.delete(key);
    
    logger.debug(`Cache DELETE`, {
      component: 'Cache',
      action: 'DELETE',
      key,
      existed,
    });
  },

  clear(): void {
    const size = cacheStore.size;
    cacheStore.clear();
    
    logger.debug(`Cache CLEAR`, {
      component: 'Cache',
      action: 'CLEAR',
      previousSize: size,
    });
  },
};
