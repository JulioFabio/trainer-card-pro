import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/telemetry';
import { forbidden, notFound, unauthorized } from '@/lib/api/errors';

export interface ApiUser {
  id: string;
  role: 'GM' | 'PLAYER';
}

// Exige sessão e confere o perfil no banco: a sessão (JWT) pode durar até 3 h, então um
// perfil removido ou rebaixado precisa deixar de valer na próxima requisição. O papel
// usado nas decisões vem sempre do banco, nunca do token.
export async function requireUser(): Promise<ApiUser> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw unauthorized();

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!user) {
    logger.warn('Sessão de perfil removido recusada', { userId: id });
    throw unauthorized('Sua sessão expirou. Entre novamente.');
  }

  return { id: user.id, role: user.role === 'GM' ? 'GM' : 'PLAYER' };
}

// Escrita: só o dono da ficha ou o GM. A leitura é aberta a qualquer usuário logado.
export function canWrite(user: ApiUser, ownerId: string): boolean {
  return user.role === 'GM' || user.id === ownerId;
}

// Mover um Pokémon ou item para outra ficha só é permitido ao GM, e o destino precisa existir.
export async function assertCanMoveTo(user: ApiUser, targetCharacterId: string): Promise<void> {
  if (user.role !== 'GM') {
    logger.warn('Mudança de ficha de Pokémon ou item negada', { userId: user.id, targetCharacterId });
    throw forbidden('Acesso negado. Apenas o Mestre (GM) pode mover registros entre fichas.');
  }
  const target = await prisma.character.findUnique({ where: { id: targetCharacterId }, select: { id: true } });
  if (!target) throw notFound('Ficha de destino não encontrada.');
}

export async function loadCharacterForWrite(
  user: ApiUser,
  characterId: string
): Promise<{ id: string; userId: string }> {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { id: true, userId: true },
  });
  if (!character) throw notFound('Personagem não encontrado.');

  if (!canWrite(user, character.userId)) {
    logger.warn('Escrita negada em ficha de outro jogador', { userId: user.id, characterId });
    throw forbidden('Acesso negado. Você não tem permissão para alterar esta ficha.');
  }

  return character;
}
