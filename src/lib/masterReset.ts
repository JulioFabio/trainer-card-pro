import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/telemetry';
import { getDataDir } from '@/lib/authSecret';

export const RESET_FILE_NAME = 'RESET_SENHA_MESTRE';

// Recuperação da senha do Mestre: quem tem acesso à pasta do app (o próprio mestre)
// cria o arquivo e reinicia o app. Na inicialização a senha do Mestre é apagada, o
// arquivo é removido e o evento é registrado, sem nenhuma senha no log.
export async function applyMasterPasswordReset(dataDir: string = getDataDir()): Promise<boolean> {
  const file = path.join(dataDir, RESET_FILE_NAME);
  if (!fs.existsSync(file)) return false;

  try {
    await prisma.user.updateMany({ where: { role: 'GM' }, data: { passwordHash: null } });
    fs.rmSync(file, { force: true });
    logger.warn('Senha do Mestre redefinida pelo arquivo RESET_SENHA_MESTRE');
    return true;
  } catch (err) {
    logger.error('Falha ao redefinir a senha do Mestre pelo arquivo de reset', err);
    return false;
  }
}
