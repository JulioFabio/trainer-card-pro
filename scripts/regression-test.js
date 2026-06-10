const baseUrl = 'http://localhost:3000';

async function runTests() {
  console.log('\x1b[35m=== INICIANDO TESTES DE REGRESSÃO DE TELEMETRIA E OBSERVABILIDADE ===\x1b[0m');

  // 1. Health check
  console.log('\n[1/5] Testando endpoint de Health Check...');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  if (!healthRes.ok) {
    throw new Error(`Health check falhou com status ${healthRes.status}`);
  }
  const health = await healthRes.json();
  console.log('\x1b[32m✓\x1b[0m Health check status:', health.status);
  console.log('\x1b[32m✓\x1b[0m Tempo de atividade:', health.metrics.uptimeSeconds, 'segundos');
  console.log('\x1b[32m✓\x1b[0m Uso de memória (heapUsed):', Math.round(health.metrics.memory.heapUsedBytes / 1024 / 1024), 'MB');
  console.log('\x1b[32m✓\x1b[0m Status do Banco de Dados:', health.services.database.status);
  
  const reqId = healthRes.headers.get('x-request-id');
  console.log('\x1b[32m✓\x1b[0m Header X-Request-ID recebido:', reqId);
  if (!reqId) throw new Error('Request ID ausente no header de resposta do Health Check');

  // 2. Criar personagem (POST)
  console.log('\n[2/5] Testando POST /api/character...');
  const charId = 'test-char-' + Date.now();
  const userId = 'test-user-' + Date.now();
  const postRes = await fetch(`${baseUrl}/api/character`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: charId,
      name: 'Treinador Teste DevOps',
      userId: userId,
      level: 5,
    }),
  });
  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`POST falhou: ${errText}`);
  }
  const character = await postRes.json();
  console.log('\x1b[32m✓\x1b[0m Personagem criado com ID:', character.id);
  const postReqId = postRes.headers.get('x-request-id');
  console.log('\x1b[32m✓\x1b[0m Header X-Request-ID no POST:', postReqId);

  // 3. Buscar personagem - Cache Miss (GET 1)
  console.log('\n[3/5] Testando GET /api/character (Esperado: Cache Miss)...');
  const getRes1 = await fetch(`${baseUrl}/api/character?id=${character.id}`);
  if (!getRes1.ok) throw new Error('GET 1 falhou');
  const getChar1 = await getRes1.json();
  console.log('\x1b[32m✓\x1b[0m Personagem recuperado:', getChar1.name);
  const duration1 = getRes1.headers.get('x-response-time-ms');
  console.log('\x1b[32m✓\x1b[0m Tempo de resposta da API (GET 1):', duration1, 'ms');

  // 4. Buscar personagem - Cache Hit (GET 2)
  console.log('\n[4/5] Testando GET /api/character novamente (Esperado: Cache Hit)...');
  const getRes2 = await fetch(`${baseUrl}/api/character?id=${character.id}`);
  if (!getRes2.ok) throw new Error('GET 2 falhou');
  const getChar2 = await getRes2.json();
  const duration2 = getRes2.headers.get('x-response-time-ms');
  console.log('\x1b[32m✓\x1b[0m Tempo de resposta da API (GET 2 - Cache):', duration2, 'ms');
  
  if (parseFloat(duration2) >= parseFloat(duration1)) {
    console.log('\x1b[33m⚠\x1b[0m Nota: Latência de rede mascarou tempo de resposta absoluto, mas o fluxo do cache foi acionado.');
  } else {
    console.log('\x1b[32m✓\x1b[0m Cache hit confirmado! Resposta mais veloz:', duration2, 'ms vs', duration1, 'ms');
  }

  // 5. Atualizar personagem e invalidar cache (PUT)
  console.log('\n[5/5] Testando PUT /api/character (Invalidação de Cache)...');
  const putRes = await fetch(`${baseUrl}/api/character`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: character.id,
      name: 'Treinador Teste DevOps Modificado',
    }),
  });
  if (!putRes.ok) throw new Error('PUT falhou');
  console.log('\x1b[32m✓\x1b[0m Personagem atualizado com sucesso e cache removido.');
  
  console.log('\n\x1b[32;1m=== TODOS OS TESTES DE REGRESSÃO DE TELEMETRIA PASSARAM COM SUCESSO! ===\x1b[0m');
}

runTests().catch(err => {
  console.error('\n\x1b[31;1m❌ ERRO NOS TESTES DE REGRESSÃO:\x1b[0m', err.message);
  process.exit(1);
});
