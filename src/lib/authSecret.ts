import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SECRET_FILE_NAME = '.auth-secret';

export function getDataDir(env: NodeJS.ProcessEnv = process.env): string {
  return env.APP_DATA_DIR ? path.resolve(env.APP_DATA_DIR) : process.cwd();
}

// Ordem: AUTH_SECRET do ambiente, arquivo local da instalação, segredo novo gerado.
// Nunca existe um valor fixo no código. Durante o build não cria arquivo, para que um
// build distribuível jamais embuta um segredo.
export function resolveAuthSecret(env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = env.AUTH_SECRET || env.NEXTAUTH_SECRET;
  if (fromEnv) return fromEnv;

  const file = path.join(getDataDir(env), SECRET_FILE_NAME);
  try {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing) return existing;
  } catch {
    // arquivo ainda não existe
  }

  const generated = randomBytes(32).toString('base64url');
  if (env.NEXT_PHASE === 'phase-production-build') return generated;

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, generated, { mode: 0o600 });
  return generated;
}
