// Executado uma vez quando o servidor Next inicia.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { applyMasterPasswordReset } = await import('@/lib/masterReset');
  await applyMasterPasswordReset();
}
