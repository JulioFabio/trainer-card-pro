export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

interface Entry {
  failures: number;
  windowStart: number;
  blockedUntil: number;
}

// Contador em memória por perfil. O app roda em um único processo, então não
// precisa sobreviver a reinício nem ser compartilhado.
export function createLoginLimiter(now: () => number = Date.now) {
  const entries = new Map<string, Entry>();

  return {
    isBlocked(key: string): boolean {
      const entry = entries.get(key);
      if (!entry) return false;
      if (entry.blockedUntil > now()) return true;
      if (now() - entry.windowStart >= WINDOW_MS) entries.delete(key);
      return false;
    },

    recordFailure(key: string): void {
      const t = now();
      let entry = entries.get(key);
      if (!entry || t - entry.windowStart >= WINDOW_MS) {
        entry = { failures: 0, windowStart: t, blockedUntil: 0 };
        entries.set(key, entry);
      }
      entry.failures += 1;
      if (entry.failures >= MAX_FAILURES) entry.blockedUntil = t + WINDOW_MS;
    },

    reset(key: string): void {
      entries.delete(key);
    },
  };
}

export const loginLimiter = createLoginLimiter();
