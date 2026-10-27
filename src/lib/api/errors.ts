// Erro de negócio com status HTTP. Os helpers das rotas o lançam e o `withTelemetry`
// o converte na resposta `{ error }`, o que mantém as rotas lineares e o formato único.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const unauthorized = (message = 'Não autorizado. Faça login para continuar.') =>
  new HttpError(401, message);

export const forbidden = (message = 'Acesso negado. Você não tem permissão para esta operação.') =>
  new HttpError(403, message);

export const notFound = (message = 'Registro não encontrado.') => new HttpError(404, message);

export const badRequest = (message: string) => new HttpError(400, message);

export const conflict = (message: string) => new HttpError(409, message);

export const payloadTooLarge = (message: string) => new HttpError(413, message);
