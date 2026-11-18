/**
 * Verifica tutti gli esercizi nel browser vero (Playwright), usando l'interfaccia:
 * per ogni esercizio il codice iniziale deve risultare "Non ancora" e la soluzione "Superato".
 * Controlla anche un errore di sintassi e il blocco di un ciclo infinito.
 *
 * Uso: npm run build && npm run verifica:esercizi
 * (avvia da solo `astro preview`; richiede Playwright con Chromium)
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readdirSync, readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const PORT = 4329;
const BASE = `http://localhost:${PORT}/accademia-dati`;

const weeks = readdirSync('src/content/settimane')
  .filter((f) => /esercizi:\n/.test(readFileSync(`src/content/settimane/${f}`, 'utf8')))
  .map((f) => f.replace(/\.mdx$/, ''));

// In Astro 7 `astro preview` resta attivo in background: va fermato con `astro preview stop`.
spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });
let stopped = false;
const stop = () => {
  if (stopped) return;
  stopped = true;
  server.kill();
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
};
process.on('exit', stop);

async function waitServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}/`)).ok) return; } catch { /* non ancora pronto */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Il server di anteprima non risponde');
}

async function verdict(ex) {
  const v = ex.locator('.ex-verdict');
  await v.waitFor({ timeout: 180_000 });
  return { ok: await v.evaluate((n) => n.classList.contains('ok')), text: (await v.innerText()).replace(/\s+/g, ' ').trim() };
}

let failures = 0;
const log = (ok, msg) => { if (!ok) failures++; console.log(`${ok ? '✔' : '✘'} ${msg}`); };

await waitServer();
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on('pageerror', (e) => log(false, `errore JavaScript: ${e.message}`));

for (const w of weeks) {
  await page.goto(`${BASE}/fase-1/${w}/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  const exs = page.locator('section.ex');
  const n = await exs.count();
  for (let i = 0; i < n; i++) {
    const ex = exs.nth(i);
    await ex.scrollIntoViewIfNeeded();
    await ex.locator('.cm-content').waitFor({ timeout: 30_000 });
    const title = (await ex.locator('h3').innerText()).trim();

    await ex.getByRole('button', { name: 'Verifica' }).click();
    const a = await verdict(ex);
    log(!a.ok, `${w} · ${title} · codice iniziale → ${a.text.slice(0, 90)}`);

    await ex.getByRole('button', { name: /^Soluzione$/ }).click();
    await ex.getByRole('button', { name: 'Mostra soluzione' }).click();
    await ex.getByRole('button', { name: "Copia nell'editor" }).click();
    await ex.getByRole('button', { name: 'Verifica' }).click();
    await ex.locator('.ex-verdict').first().waitFor();
    await page.waitForFunction((el) => !el.querySelector('.ex-loading'), await ex.elementHandle(), { timeout: 180_000 });
    const b = await verdict(ex);
    log(b.ok, `${w} · ${title} · soluzione → ${b.text.slice(0, 90)}`);
  }
}

// Casi limite su un esercizio Python e uno SQL
async function typeAndRun(week, code, expectRe, label) {
  await page.goto(`${BASE}/fase-1/${week}/`, { waitUntil: 'networkidle' });
  const ex = page.locator('section.ex').first();
  await ex.scrollIntoViewIfNeeded();
  await ex.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(code);
  const t0 = Date.now();
  await ex.getByRole('button', { name: 'Esegui' }).click();
  await ex.locator('.ex-error').waitFor({ timeout: 60_000 });
  const text = await ex.locator('.ex-error').innerText();
  log(expectRe.test(text), `${label} → ${text.split('\n')[0].slice(0, 100)} (${Math.round((Date.now() - t0) / 1000)} s)`);
}
await typeAndRun('settimana-02', 'while True:\n    pass\n', /secondi/, 'Python, ciclo infinito fermato');
await typeAndRun('settimana-02', 'print("ciao"\n', /SyntaxError/, 'Python, errore di sintassi');
await typeAndRun('settimana-05', "SELEC comune FROM 'comuni.csv'", /sintassi/i, 'SQL, errore di sintassi');
await typeAndRun('settimana-05', "SELECT abitanti FROM 'comuni.csv'", /non esiste/, 'SQL, colonna inesistente');

await browser.close();
stop();
console.log(failures ? `\n${failures} controlli falliti` : '\nTutti i controlli superati');
process.exit(failures ? 1 : 0);
