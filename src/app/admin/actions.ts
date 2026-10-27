"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/telemetry";
import { revalidatePath } from "next/cache";

// Server Action crítica para exclusão de fichas por GMs
export async function deleteCharacterAction(characterId: string) {
  // 1. Obter e validar a sessão ativamente no servidor
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }

  // 2. Verificar o cargo do usuário diretamente do banco para mitigar falsificações/JWT expirados
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "GM") {
    logger.warn(`Tentativa não autorizada de exclusão de ficha por usuário comum`, {
      userId: session.user.id,
      characterId,
    });
    throw new Error("Acesso negado. Apenas o Mestre (GM) pode realizar esta operação.");
  }

  logger.warn(`GM deletando ficha do sistema`, {
    gmUserId: session.user.id,
    characterId,
  });

  // 3. Executar a exclusão no SQLite
  await prisma.character.delete({
    where: { id: characterId },
  });

  // Revalida a rota do painel para refletir a remoção imediatamente
  revalidatePath("/admin");

  return { success: true };
}
