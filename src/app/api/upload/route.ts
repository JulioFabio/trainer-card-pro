import { NextResponse } from 'next/server';
import { withTelemetry } from '@/lib/telemetry';
import { loadCharacterForWrite, requireUser } from '@/lib/api/access';
import { badRequest, payloadTooLarge } from '@/lib/api/errors';
import { parseValue } from '@/lib/api/parse';
import { detectImageType, MAX_IMAGE_BYTES, saveImage } from '@/lib/api/imageUpload';
import { characterIdSchema } from '@/lib/schemas';

// Margem para os cabeçalhos do formulário multipart além do arquivo.
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 64 * 1024;

export const POST = withTelemetry(async function POST(request: Request) {
  const user = await requireUser();

  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    throw payloadTooLarge('A imagem deve ter no máximo 5 MB.');
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    throw badRequest('A requisição precisa ser um formulário com o arquivo e o characterId.');
  }

  const file = formData.get('file');
  const rawCharacterId = formData.get('characterId');
  if (!(file instanceof File) || typeof rawCharacterId !== 'string') {
    throw badRequest('Arquivo ou characterId ausente na requisição.');
  }

  const characterId = parseValue(rawCharacterId, characterIdSchema, 'characterId');
  await loadCharacterForWrite(user, characterId);

  if (file.size > MAX_IMAGE_BYTES) throw payloadTooLarge('A imagem deve ter no máximo 5 MB.');

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = detectImageType(buffer);
  if (!extension) throw badRequest('O arquivo precisa ser uma imagem PNG, JPEG, WebP ou GIF.');

  const { url } = await saveImage(characterId, buffer, extension);
  return NextResponse.json({ url }, { status: 201 });
});
