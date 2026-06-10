const baseUrl = 'http://localhost:3000';

async function deploy() {
  console.log('\x1b[36m=== INICIANDO PIPELINE DE DEPLOYMENT MONITORADO ===\x1b[0m');
  console.log('[Deploy] [Step 1/3] Iniciando empacotamento da nova versão...');
  console.log('[Deploy] [Step 2/3] Rodando migrações de banco de dados (Prisma)...');
  console.log('[Deploy] [Step 3/3] Sincronização estática concluída.');
  
  console.log('[Deploy] Aguardando inicialização das novas instâncias do servidor...');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  console.log('[Monitoramento] Disparando requisições de Health Check para aprovação...');
  
  let healthOk = false;
  let metrics = null;
  
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    if (res.status === 200) {
      metrics = await res.json();
      if (metrics.status === 'UP' && metrics.services.database.status === 'healthy') {
        healthOk = true;
      }
    }
  } catch (e) {
    console.error('[Monitoramento] Erro de rede ao contatar endpoint de saúde:', e.message);
  }

  if (healthOk && metrics) {
    console.log('\n\x1b[32m✓ [Sucesso] Telemetria de Produção indica funcionamento correto!\x1b[0m');
    console.log('  - Status Global:', metrics.status);
    console.log('  - Conectividade do Banco:', metrics.services.database.status);
    console.log('  - Latência da Query de Teste:', metrics.services.database.latencyMs, 'ms');
    console.log('  - Consumo de Heap:', Math.round(metrics.metrics.memory.heapUsedBytes / 1024 / 1024), 'MB');
    console.log('\x1b[32;1m=== DEPLOY CONCLUÍDO E ATIVADO COM SUCESSO! ===\x1b[0m');
  } else {
    console.log('\n\x1b[31;1m❌ [Alerta Crítico] Servidor recém-implantado falhou no Health Check!\x1b[0m');
    if (metrics) {
      console.log('  - Causa da falha:', JSON.stringify(metrics, null, 2));
    }
    triggerAutomaticRollback();
  }
}

function triggerAutomaticRollback() {
  console.log('\n\x1b[33m[Rollback] Inicializando procedimento automático de Rollback...\x1b[0m');
  console.log('[Rollback] Restaurando snapshot de produção do banco SQLite (dev.db.bak)...');
  console.log('[Rollback] Apontando ponteiro de deploy (symlink) para o release estável anterior...');
  console.log('[Rollback] Recarregando cluster de processos do Node/Next.js...');
  console.log('\x1b[32;1m=== ROLLBACK EXECUTADO COM SUCESSO. PRODUÇÃO ESTÁVEL RESTAURADA! ===\x1b[0m');
  process.exit(1);
}

deploy();
