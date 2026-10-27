import { prisma } from '@/lib/prisma';

export const DEFAULT_SESSION_NAME = 'Minha Mesa';
export const SESSION_NAME_KEY = 'sessionName';

export interface LoginProfile {
  id: string;
  name: string;
  requiresPassword: boolean;
}

export async function getSessionName(): Promise<string> {
  const setting = await prisma.appSetting.findUnique({ where: { key: SESSION_NAME_KEY } });
  return setting?.value?.trim() || DEFAULT_SESSION_NAME;
}

// Lista pública da tela de entrada. Nunca devolve o hash da senha: só se ela é exigida.
// O Mestre aparece apenas quando definiu uma senha para entrar de outro aparelho.
export async function listLoginProfiles(): Promise<LoginProfile[]> {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true, passwordHash: true },
    orderBy: { name: 'asc' },
  });

  return users
    .filter((user) => user.role !== 'GM' || !!user.passwordHash)
    .map((user) => ({
      id: user.id,
      name: user.name ?? '',
      requiresPassword: !!user.passwordHash,
    }));
}
