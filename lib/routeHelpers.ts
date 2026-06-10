import { NextResponse } from 'next/server';

export function getQueryParam(request: Request, name: string): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get(name);
}

export interface RequiredParamResult {
  value: string | null;
  response: NextResponse | null;
}

export function requireQueryParam(
  request: Request,
  name: string,
  customError?: string
): RequiredParamResult {
  const value = getQueryParam(request, name);
  if (!value) {
    return {
      value: null,
      response: NextResponse.json(
        { error: customError || `O parâmetro '${name}' é obrigatório` },
        { status: 400 }
      ),
    };
  }
  return { value, response: null };
}
