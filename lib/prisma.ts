import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { handleQueryEvent } from './queryLog';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  const sqlite = new Database(dbUrl.replace(/^file:/, ''));

  // Ativa modo WAL (persistente no arquivo) para alta concorrência de múltiplos jogadores simultâneos
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.close();

  // Prisma 7: o adaptador abre a própria conexão (timeout de 5s para locks)
  const adapter = new PrismaBetterSqlite3({ url: dbUrl, timeout: 5000 });
  const client = new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'stdout', level: 'warn' },
      { emit: 'stdout', level: 'error' },
    ],
  });

  (client as any).$on('query', handleQueryEvent);

  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
