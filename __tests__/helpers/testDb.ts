import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { detectImageType, MAX_IMAGE_BYTES } from '@/lib/api/imageUpload';
import { diskPhotoStore } from '@/lib/characterModel/photos';
import type { StoreDeps } from '@/lib/characterModel/store';

// SQLite temporário com o esquema real (prisma db push), para testar restrições de
// unicidade, cascata e transação, que um mock do Prisma esconderia.
export interface TestDb {
  prisma: PrismaClient;
  deps: StoreDeps;
  uploadsDir: string;
  createCharacter(): Promise<string>;
  totalChanges(): Promise<number>;
  cleanup(): Promise<void>;
}

export async function createTestDb(): Promise<TestDb> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tcp-db-'));
  const url = `file:${path.join(dir, 'test.db')}`;
  const prismaCli = path.resolve('node_modules', 'prisma', 'build', 'index.js');

  execFileSync(process.execPath, [prismaCli, 'db', 'push'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });

  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
  const uploadsDir = path.join(dir, 'uploads');
  const deps: StoreDeps = {
    prisma,
    photos: { store: diskPhotoStore(uploadsDir), detectImageType, maxBytes: MAX_IMAGE_BYTES },
  };

  let counter = 0;
  return {
    prisma,
    deps,
    uploadsDir,
    async createCharacter() {
      counter += 1;
      const user = await prisma.user.create({ data: { name: `Jogador ${counter}` } });
      const character = await prisma.character.create({ data: { name: `Ficha ${counter}`, userId: user.id } });
      return character.id;
    },
    async totalChanges() {
      const rows = await prisma.$queryRaw<{ n: number | bigint }[]>`SELECT total_changes() AS n`;
      return Number(rows[0].n);
    },
    async cleanup() {
      await prisma.$disconnect();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
