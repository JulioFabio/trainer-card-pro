"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/telemetry";
import { revalidatePath } from "next/cache";
import { hashPassword, isValidPassword, MIN_PASSWORD_LENGTH } from "@/lib/password";
import { cleanProfileName, normalizeProfileName, validateProfileName } from "@/lib/profileName";
import { SESSION_NAME_KEY } from "@/lib/profiles";

export type ActionResult = { success: true } | { success: false; error: string };

const PASSWORD_ERROR = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
const MAX_SESSION_NAME_LENGTH = 60;

// Exige sessão ativa e confere o papel de GM direto no banco a cada chamada,
// para não confiar só no que está no token.
async function requireGm(action: string): Promise<string> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("Não autorizado. Faça login para continuar.");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "GM") {
    logger.warn(`Tentativa não autorizada de ação restrita ao Mestre`, {
      userId: session.user.id,
      action,
    });
    throw new Error("Acesso negado. Apenas o Mestre (GM) pode realizar esta operação.");
  }

  return session.user.id;
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/login");
}

// Server Action crítica para exclusão de fichas por GMs
export async function deleteCharacterAction(characterId: string) {
  const gmUserId = await requireGm("deleteCharacter");

  logger.warn(`GM deletando ficha do sistema`, {
    gmUserId,
    characterId,
  });

  await prisma.character.delete({
    where: { id: characterId },
  });

  revalidatePath("/admin");

  return { success: true };
}

export async function createProfileAction(name: string, password?: string): Promise<ActionResult> {
  const gmUserId = await requireGm("createProfile");

  const nameError = validateProfileName(name);
  if (nameError) return { success: false, error: nameError };
  if (password && !isValidPassword(password)) return { success: false, error: PASSWORD_ERROR };

  const cleaned = cleanProfileName(name);
  const username = normalizeProfileName(cleaned);

  const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (existing) return { success: false, error: "Já existe um perfil com esse nome." };

  const created = await prisma.user.create({
    data: {
      name: cleaned,
      username,
      role: "PLAYER",
      passwordHash: password ? await hashPassword(password) : null,
    },
    select: { id: true },
  });

  logger.info("Perfil de jogador criado", { gmUserId, profileId: created.id, hasPassword: !!password });
  refresh();
  return { success: true };
}

export async function renameProfileAction(profileId: string, newName: string): Promise<ActionResult> {
  const gmUserId = await requireGm("renameProfile");

  const nameError = validateProfileName(newName);
  if (nameError) return { success: false, error: nameError };

  const target = await prisma.user.findUnique({ where: { id: profileId }, select: { id: true, role: true } });
  if (!target || target.role !== "PLAYER") return { success: false, error: "Perfil não encontrado." };

  const cleaned = cleanProfileName(newName);
  const username = normalizeProfileName(cleaned);

  const clash = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (clash && clash.id !== profileId) return { success: false, error: "Já existe um perfil com esse nome." };

  await prisma.user.update({ where: { id: profileId }, data: { name: cleaned, username } });

  logger.info("Perfil de jogador renomeado", { gmUserId, profileId });
  refresh();
  return { success: true };
}

// Remove o perfil e, por cascata do esquema, as fichas dele.
export async function removeProfileAction(profileId: string): Promise<ActionResult> {
  const gmUserId = await requireGm("removeProfile");

  const target = await prisma.user.findUnique({ where: { id: profileId }, select: { id: true, role: true } });
  if (!target || target.role !== "PLAYER") return { success: false, error: "Perfil não encontrado." };

  await prisma.user.delete({ where: { id: profileId } });

  logger.warn("Perfil de jogador removido junto com as fichas", { gmUserId, profileId });
  refresh();
  return { success: true };
}

// Senha vazia remove a senha do perfil.
export async function setProfilePasswordAction(profileId: string, password: string): Promise<ActionResult> {
  const gmUserId = await requireGm("setProfilePassword");

  if (password && !isValidPassword(password)) return { success: false, error: PASSWORD_ERROR };

  const target = await prisma.user.findUnique({ where: { id: profileId }, select: { id: true, role: true } });
  if (!target || target.role !== "PLAYER") return { success: false, error: "Perfil não encontrado." };

  await prisma.user.update({
    where: { id: profileId },
    data: { passwordHash: password ? await hashPassword(password) : null },
  });

  logger.info("Senha de perfil alterada", { gmUserId, profileId, hasPassword: !!password });
  refresh();
  return { success: true };
}

// Senha do Mestre, usada só para entrar de outro aparelho. Vazia remove.
export async function setMasterPasswordAction(password: string): Promise<ActionResult> {
  const gmUserId = await requireGm("setMasterPassword");

  if (password && !isValidPassword(password)) return { success: false, error: PASSWORD_ERROR };

  await prisma.user.update({
    where: { id: gmUserId },
    data: { passwordHash: password ? await hashPassword(password) : null },
  });

  logger.info("Senha do Mestre alterada", { gmUserId, hasPassword: !!password });
  refresh();
  return { success: true };
}

export async function setSessionNameAction(name: string): Promise<ActionResult> {
  const gmUserId = await requireGm("setSessionName");

  const cleaned = typeof name === "string" ? cleanProfileName(name) : "";
  if (!cleaned) return { success: false, error: "Informe o nome da sessão." };
  if (cleaned.length > MAX_SESSION_NAME_LENGTH) {
    return { success: false, error: `O nome da sessão pode ter no máximo ${MAX_SESSION_NAME_LENGTH} caracteres.` };
  }

  await prisma.appSetting.upsert({
    where: { key: SESSION_NAME_KEY },
    update: { value: cleaned },
    create: { key: SESSION_NAME_KEY, value: cleaned },
  });

  logger.info("Nome da sessão alterado", { gmUserId });
  refresh();
  return { success: true };
}
