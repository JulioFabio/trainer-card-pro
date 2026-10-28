// Seed de DESENVOLVIMENTO: cria perfis de teste no banco limpo.
// Uso: npm run seed:dev. Não faz parte da versão distribuída e não é importado pelo app.
// Roda direto no Node 24 (remoção de tipos), por isso os imports usam caminho relativo com .ts.
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { detectImageType, getUploadsRoot, MAX_IMAGE_BYTES } from '../src/lib/api/imageUpload.ts';
import { diskPhotoStore } from '../src/lib/characterModel/photos.ts';
import { saveCharacterSheet } from '../src/lib/characterModel/store.ts';
import { buildTulioSheet } from './seedSheet.ts';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });

const SESSION_NAME = 'Mesa de Teste';
const TEST_PROFILES = ['Túlio', 'Robert', 'Black'];

function normalize(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

async function main() {
  await prisma.appSetting.upsert({
    where: { key: 'sessionName' },
    update: { value: SESSION_NAME },
    create: { key: 'sessionName', value: SESSION_NAME },
  });

  for (const name of TEST_PROFILES) {
    const username = normalize(name);
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: { name, username, role: 'PLAYER' },
    });
  }

  // Ficha rica do Túlio (equipe, PC, mochila, talentos), gravada pelas mesmas funções do app.
  // Idempotente: a gravação compara por ref, então rodar de novo não duplica nada.
  const tulio = await prisma.user.findUniqueOrThrow({ where: { username: normalize('Túlio') } });
  const existing = await prisma.character.findFirst({ where: { userId: tulio.id } });
  const character =
    existing ?? (await prisma.character.create({ data: { name: 'Túlio', userId: tulio.id, level: 5 } }));
  await saveCharacterSheet(
    {
      prisma,
      photos: { store: diskPhotoStore(getUploadsRoot()), detectImageType, maxBytes: MAX_IMAGE_BYTES },
    },
    character.id,
    buildTulioSheet()
  );

  const total = await prisma.user.count({ where: { role: 'PLAYER' } });
  console.log(`Seed concluído: sessão "${SESSION_NAME}" e ${total} perfil(is) de jogador (${TEST_PROFILES.join(', ')}).`);
}

main()
  .catch((err) => {
    console.error('Falha no seed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
