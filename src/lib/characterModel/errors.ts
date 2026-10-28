// Erro de regra da ficha (conteúdo inválido, posição repetida, foto recusada...).
// A rota converte `status` em HttpError; este módulo não depende de '@/...'.
export class CharacterModelError extends Error {
  readonly status: 400 | 413 | 409;

  constructor(message: string, status: 400 | 413 | 409 = 400) {
    super(message);
    this.name = 'CharacterModelError';
    this.status = status;
  }
}
