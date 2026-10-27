// Executado uma vez quando o servidor Next inicia. O import fica dentro do `if` positivo
// para o bundler descartar o ramo no runtime Edge (que não tem fs nem SQLite).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { applyMasterPasswordReset } = await import('@/lib/masterReset');
    await applyMasterPasswordReset();
  }
}
