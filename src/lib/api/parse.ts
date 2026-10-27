import { z } from 'zod';
import { badRequest, HttpError, payloadTooLarge } from '@/lib/api/errors';
import { TOO_LARGE_FLAG } from '@/lib/schemas';

export const MAX_BODY_BYTES = 10 * 1024 * 1024;

// Converte o primeiro problema de validação em uma mensagem em português que cita o
// campo, mas nunca repete o valor enviado.
function describeIssue(issue: z.core.$ZodIssue, fieldName?: string): HttpError {
  const field = issue.path.length > 0 ? issue.path.join('.') : (fieldName ?? 'corpo');
  const label = `Campo "${field}"`;

  switch (issue.code) {
    case 'unrecognized_keys': {
      const keys = (issue as { keys: string[] }).keys.join(', ');
      return badRequest(`Campo(s) não permitido(s): ${keys}.`);
    }
    case 'invalid_type': {
      const { expected, message } = issue as { expected: string; message: string };
      if (/received undefined/.test(message)) return badRequest(`${label} é obrigatório.`);
      if (expected === 'int') return badRequest(`${label} deve ser um número inteiro.`);
      return badRequest(`${label} tem um tipo inválido.`);
    }
    case 'too_small': {
      const { origin, minimum } = issue as { origin: string; minimum: number | bigint };
      return badRequest(
        origin === 'string'
          ? `${label} deve ter pelo menos ${minimum} caractere(s).`
          : `${label} deve ser no mínimo ${minimum}.`
      );
    }
    case 'too_big': {
      const { origin, maximum } = issue as { origin: string; maximum: number | bigint };
      return badRequest(
        origin === 'string'
          ? `${label} deve ter no máximo ${maximum} caracteres.`
          : `${label} deve ser no máximo ${maximum}.`
      );
    }
    case 'invalid_format':
      return badRequest(`${label} tem um formato inválido.`);
    case 'invalid_value':
      return badRequest(`${label} tem um valor não permitido.`);
    case 'custom': {
      const params = (issue as { params?: Record<string, unknown> }).params;
      if (params?.[TOO_LARGE_FLAG]) return payloadTooLarge(`${label} excede o tamanho máximo permitido.`);
      return badRequest(`${label} ${issue.message}`);
    }
    default:
      return badRequest(`${label} é inválido.`);
  }
}

function validate<T extends z.ZodType>(schema: T, input: unknown, fieldName?: string): z.infer<T> {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw describeIssue(result.error.issues[0], fieldName);
}

// Lê o corpo JSON com limite de tamanho. JSON inválido é 400, não erro interno.
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<z.infer<T>> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw payloadTooLarge('O corpo da requisição é grande demais.');
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw payloadTooLarge('O corpo da requisição é grande demais.');

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw badRequest('O corpo da requisição não é um JSON válido.');
  }

  if (json === null || typeof json !== 'object' || Array.isArray(json)) {
    throw badRequest('O corpo da requisição deve ser um objeto JSON.');
  }
  return validate(schema, json);
}

export function parseQuery<T extends z.ZodType>(request: Request, schema: T): z.infer<T> {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  return validate(schema, params);
}

export function parseValue<T extends z.ZodType>(value: unknown, schema: T, fieldName?: string): z.infer<T> {
  return validate(schema, value, fieldName);
}
