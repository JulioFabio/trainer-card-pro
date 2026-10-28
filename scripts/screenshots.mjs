// Tira prints das telas principais para acompanhar mudanças visuais.
// Uso: npm run shots [rótulo]   ex.: npm run shots fase-3
// Sobe uma cópia isolada do app (banco temporário em .shots/, outra porta e outra pasta de
// build), então não mexe no dev.db nem atrapalha um `npm run dev` em andamento.
// Saída: screenshots/<data-hora>[-rótulo]/ e uma cópia em screenshots/latest/.
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 3120;
const BASE = `http://localhost:${PORT}`;
const root = process.cwd();
const tmpDir = path.join(root, '.shots');

const label = process.argv[2] ? `-${process.argv[2].replace(/[^\w.-]+/g, '-')}` : '';
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
const outDir = path.join(root, 'screenshots', `${stamp}${label}`);
const latestDir = path.join(root, 'screenshots', 'latest');

const env = {
  ...process.env,
  DATABASE_URL: 'file:./.shots/shots.db',
  NEXT_DIST_DIR: '.shots/next',
  NODE_ENV: 'development',
};

const BROWSERS = [
  process.env.BROWSER_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'pipe', shell: false });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} falhou:\n${result.stdout}${result.stderr}`);
  }
}

async function waitFor(url, ms = 90_000) {
  const limit = Date.now() + ms;
  while (Date.now() < limit) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error(`O servidor não respondeu em ${url}`);
}

const results = [];
async function shot(page, name, action, { fullPage = false } = {}) {
  try {
    await action?.();
    await page.waitForTimeout(700);
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage });
    results.push({ name, ok: true });
    console.log(`  ok    ${name}`);
  } catch (err) {
    results.push({ name, ok: false });
    console.log(`  FALHA ${name}: ${String(err.message).split('\n')[0]}`);
  }
}

async function main() {
  const executablePath = BROWSERS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Nenhum Chrome/Edge encontrado. Defina BROWSER_PATH.');

  fs.mkdirSync(outDir, { recursive: true });
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Preparando banco temporário...');
  run(process.execPath, [path.join(root, 'node_modules', 'prisma', 'build', 'index.js'), 'db', 'push']);
  run(process.execPath, ['scripts/seed-dev.ts']);

  console.log(`Subindo o app em ${BASE}...`);
  const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  const server = spawn(process.execPath, [nextBin, 'dev', '-p', String(PORT)], { cwd: root, env, stdio: 'ignore' });
  const stopServer = () => {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    else server.kill('SIGTERM');
  };

  let browser;
  try {
    await waitFor(`${BASE}/api/health`);
    browser = await chromium.launch({ executablePath, headless: true });
    console.log(`Tirando prints em ${path.relative(root, outDir)}`);

    // ── Mestre (acesso local: entra sozinho) ─────────────────────────
    const gm = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await gm.newPage();
    page.setDefaultTimeout(30_000);

    await shot(page, '01-entrada-jogadores', async () => {
      await page.goto(`${BASE}/login?sair=1`, { waitUntil: 'networkidle' });
      await page.locator('select').waitFor();
    });

    await shot(page, '02-ficha-treinador', async () => {
      await page.getByRole('button', { name: /Entrar como Mestre/i }).click();
      await page.getByText('Mochila', { exact: true }).first().waitFor({ timeout: 60_000 });
      await page.waitForLoadState('networkidle');
    });

    // Equipe, Mochila e PC aparecem preenchidos nos prints do Túlio (ficha rica do seed).
    for (const [n, tab] of [['03', 'Combate'], ['07', 'Notas']]) {
      await shot(page, `${n}-aba-${tab.toLowerCase()}`, async () => {
        await page.getByText(tab, { exact: true }).first().click();
      });
    }

    await shot(page, '08-trocas', async () => {
      await page.getByText('Treinador', { exact: true }).first().click();
      await page.locator('[title^="Sistema de Trocas"]').click();
      await page.getByText(/link cable/i).first().waitFor();
      await page.getByText(/carregando rede/i).waitFor({ state: 'detached' });
    });

    await shot(
      page,
      '09-painel-do-mestre',
      async () => {
        await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
        await page.getByText('Sessão e perfis').waitFor();
      },
      { fullPage: true }
    );
    await gm.close();

    // ── Jogador (perfil escolhido na caixa de seleção) ───────────────
    const player = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const pp = await player.newPage();
    pp.setDefaultTimeout(30_000);
    await shot(pp, '10-ficha-jogador', async () => {
      await pp.goto(`${BASE}/login?sair=1`, { waitUntil: 'networkidle' });
      await pp.locator('select').selectOption({ label: 'Túlio' });
      await pp.getByRole('button', { name: /^Entrar$/ }).click();
      await pp.getByText('Mochila', { exact: true }).first().waitFor({ timeout: 60_000 });
      await pp.waitForLoadState('networkidle');
    });
    for (const [n, tab] of [['11', 'Equipe'], ['12', 'Mochila'], ['13', 'PC']]) {
      await shot(pp, `${n}-tulio-aba-${tab.toLowerCase()}`, async () => {
        await pp.getByText(tab, { exact: true }).first().click();
      });
    }
    await player.close();

    // ── Celular ──────────────────────────────────────────────────────
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
    const mp = await mobile.newPage();
    await shot(mp, '14-entrada-celular', async () => {
      await mp.goto(`${BASE}/login?sair=1`, { waitUntil: 'networkidle' });
      await mp.locator('select').waitFor();
    });
    await mobile.close();
  } finally {
    await browser?.close();
    stopServer();
  }

  fs.rmSync(latestDir, { recursive: true, force: true });
  fs.cpSync(outDir, latestDir, { recursive: true });

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} prints salvos em:\n  ${outDir}\n  ${latestDir}`);
  if (results.every((r) => !r.ok)) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
