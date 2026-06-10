const baseUrl = 'http://localhost:3000';

async function testPersistence() {
  console.log('\x1b[35m=== INICIANDO TESTE DE PERSISTÊNCIA DE DADOS DA FICHA ===\x1b[0m');

  const charId = 'char-123';
  const testValue = 'Jogador Teste ' + Math.floor(Math.random() * 10000);
  const testLevel = Math.floor(Math.random() * 20) + 1;
  const testAge = Math.floor(Math.random() * 50) + 10;

  console.log(`\n[1/4] Verificando se o personagem '${charId}' existe...`);
  let character;
  try {
    const getRes = await fetch(`${baseUrl}/api/character?id=${charId}`);
    if (getRes.ok) {
      character = await getRes.json();
      console.log('\x1b[32m✓\x1b[0m Personagem encontrado.');
    } else if (getRes.status === 404) {
      console.log('\x1b[33m⚠\x1b[0m Personagem não encontrado. Criando novo...');
      const postRes = await fetch(`${baseUrl}/api/character`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: charId,
          name: 'Treinador',
          userId: 'user-123',
        }),
      });
      if (!postRes.ok) throw new Error('Falha ao criar personagem');
      character = await postRes.json();
      console.log('\x1b[32m✓\x1b[0m Personagem criado com sucesso.');
    } else {
      throw new Error(`Erro inesperado ao buscar: ${getRes.status}`);
    }
  } catch (err) {
    console.error('\x1b[31m❌ Erro na busca/criação:\x1b[0m', err.message);
    process.exit(1);
  }

  console.log(`\n[2/4] Simulando salvamento de dados (PUT) com novos valores aleatórios:`);
  console.log(`  - Nome do Jogador: ${testValue}`);
  console.log(`  - Nível Geral: ${testLevel}`);
  console.log(`  - Idade: ${testAge}`);

  const updatedSheet = {
    ...character.sheetData,
    jogador: testValue,
    levelGeral: testLevel,
    idade: testAge,
  };

  try {
    const putRes = await fetch(`${baseUrl}/api/character`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: charId,
        name: 'Treinador',
        level: testLevel,
        sheetData: updatedSheet,
      }),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      throw new Error(`PUT falhou: ${errText}`);
    }
    console.log('\x1b[32m✓\x1b[0m Dados salvos no banco de dados com sucesso.');
  } catch (err) {
    console.error('\x1b[31m❌ Erro ao salvar dados:\x1b[0m', err.message);
    process.exit(1);
  }

  console.log('\n[3/4] Simulando recarregamento da página (GET para buscar novamente)...');
  let reloadedChar;
  try {
    const getRes = await fetch(`${baseUrl}/api/character?id=${charId}`);
    if (!getRes.ok) throw new Error(`GET falhou com status ${getRes.status}`);
    reloadedChar = await getRes.json();
    console.log('\x1b[32m✓\x1b[0m Personagem recarregado com sucesso.');
  } catch (err) {
    console.error('\x1b[31m❌ Erro ao recarregar:\x1b[0m', err.message);
    process.exit(1);
  }

  console.log('\n[4/4] Validando persistência de dados...');
  const reloadedSheet = reloadedChar.sheetData;
  const matchJogador = reloadedSheet.jogador === testValue;
  const matchLevel = reloadedChar.level === testLevel && reloadedSheet.levelGeral === testLevel;
  const matchIdade = reloadedSheet.idade === testAge;

  if (matchJogador && matchLevel && matchIdade) {
    console.log('\x1b[32;1m✓ SUCESSO: Os dados foram salvos e persistem no recarregamento da página!\x1b[0m');
    console.log(`  - Jogador no banco: "${reloadedSheet.jogador}" (Esperado: "${testValue}")`);
    console.log(`  - Nível no banco: ${reloadedChar.level} (Esperado: ${testLevel})`);
    console.log(`  - Idade no banco: ${reloadedSheet.idade} (Esperado: ${testAge})`);
  } else {
    console.error('\x1b[31;1m❌ ERRO: Alguns dados não correspondem aos valores salvos!\x1b[0m');
    console.log(`  - Jogador: "${reloadedSheet.jogador}" vs "${testValue}"`);
    console.log(`  - Nível: ${reloadedChar.level} vs ${testLevel}`);
    console.log(`  - Idade: ${reloadedSheet.idade} vs ${testAge}`);
    process.exit(1);
  }

  console.log('\n\x1b[35m=== TESTE DE PERSISTÊNCIA CONCLUÍDO COM SUCESSO! ===\x1b[0m');
}

testPersistence().catch(err => {
  console.error('\x1b[31m❌ ERRO INESPERADO NO TESTE:\x1b[0m', err.message);
  process.exit(1);
});
