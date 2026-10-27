export const MASTER_NAME = 'Mestre';
export const MASTER_USERNAME = 'mestre';
export const MAX_PROFILE_NAME_LENGTH = 40;

// Chave de unicidade do perfil: sem espaços nas pontas e sem diferenciar caixa.
export function normalizeProfileName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function cleanProfileName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function validateProfileName(name: unknown): string | null {
  if (typeof name !== 'string') return 'Informe o nome do perfil.';
  const cleaned = cleanProfileName(name);
  if (cleaned.length < 1) return 'Informe o nome do perfil.';
  if (cleaned.length > MAX_PROFILE_NAME_LENGTH) {
    return `O nome pode ter no máximo ${MAX_PROFILE_NAME_LENGTH} caracteres.`;
  }
  if (normalizeProfileName(cleaned) === MASTER_USERNAME) {
    return `O nome "${MASTER_NAME}" é reservado ao Mestre.`;
  }
  return null;
}
