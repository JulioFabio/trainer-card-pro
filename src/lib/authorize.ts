import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/telemetry';
import { loginLimiter } from '@/lib/loginLimiter';
import { verifyPassword } from '@/lib/password';
import { isLocalRequest } from '@/lib/localRequest';
import { MASTER_NAME, MASTER_USERNAME } from '@/lib/profileName';

export interface SessionIdentity {
  id: string;
  name: string;
  role: 'GM' | 'PLAYER';
}

function toIdentity(user: { id: string; name: string | null; role: string }): SessionIdentity {
  return { id: user.id, name: user.name ?? '', role: user.role === 'GM' ? 'GM' : 'PLAYER' };
}

// Entrada pela caixa de seleção. O papel vem do banco: qualquer outro campo enviado
// pelo cliente (inclusive `role`) é ignorado.
export async function authorizeProfile(credentials: unknown): Promise<SessionIdentity | null> {
  const input = (credentials ?? {}) as Record<string, unknown>;
  const profileId = typeof input.profileId === 'string' ? input.profileId : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (!profileId) return null;

  const user = await prisma.user.findUnique({
    where: { id: profileId },
    select: { id: true, name: true, role: true, passwordHash: true },
  });
  if (!user) return null;

  // O Mestre só entra por este caminho se tiver definido uma senha.
  if (user.role === 'GM' && !user.passwordHash) return null;

  if (loginLimiter.isBlocked(user.id)) {
    logger.warn('Entrada bloqueada temporariamente por falhas seguidas', { profileId: user.id });
    return null;
  }

  if (user.passwordHash) {
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      loginLimiter.recordFailure(user.id);
      logger.warn('Senha incorreta na entrada de perfil', { profileId: user.id });
      return null;
    }
    loginLimiter.reset(user.id);
  }

  return toIdentity(user);
}

// Entrada automática do Mestre: só vale para acesso local direto ao computador.
export async function authorizeLocalGm(headers: Headers): Promise<SessionIdentity | null> {
  if (!isLocalRequest(headers)) return null;

  const existing = await prisma.user.findFirst({
    where: { role: 'GM' },
    select: { id: true, name: true, role: true },
  });
  if (existing) return toIdentity(existing);

  const created = await prisma.user.upsert({
    where: { username: MASTER_USERNAME },
    update: { role: 'GM' },
    create: { name: MASTER_NAME, username: MASTER_USERNAME, role: 'GM' },
    select: { id: true, name: true, role: true },
  });
  logger.info('Perfil do Mestre criado na primeira entrada local');
  return toIdentity(created);
}
