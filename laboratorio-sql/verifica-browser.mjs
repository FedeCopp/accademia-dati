/**
 * Prova il file Laboratorio-SQL.html in un browser vero (Playwright), aperto da file://
 * con la rete bloccata: esempi, esercizi (query, JOIN, modifica), schema, area libera,
 * memoria dei progressi, layout a 1280 e 390 px in tema chiaro e scuro.
 * Uso: npm run lab:build && npm run lab:verifica:browser [cartella-screenshot]
 */
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const URL_FILE = pathToFileURL(join(here, 'Laboratorio-SQL.html')).href;
const SHOTS = process.argv[2];
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

let fails = 0;
const check = (ok, msg) => { if (!ok) fails++; console.log(`${ok ? '✔' : '✘'} ${msg}`); };
const browser = await chromium.launch();

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const network = [];
  await ctx.route((u) => !u.href.startsWith('file:') && !u.href.startsWith('data:'), (r) => { network.push(r.request().url()); return r.abort(); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page, errors, network };
}
async function typeSql(page, card, sql) {
  await card.locator('.cm-content').click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(sql);
}

const { ctx, page, errors, network } = await newPage();
const t0 = Date.now();
await page.goto(URL_FILE);
await page.locator('.topbar').waitFor({ timeout: 20_000 });
check(true, `avvio da file:// in ${Date.now() - t0} ms`);

// Esempio
await page.locator('.esempio').first().getByRole('button', { name: /Prova/ }).click();
check(await page.locator('.esempio').first().locator('table.res tbody tr').count() === 5, 'il primo esempio mostra 5 righe');

// Esercizio 1 del modulo 0
let card = page.locator('#esercizio');
await typeSql(page, card, 'select * from genre');
await card.getByRole('button', { name: 'Verifica' }).click();
check(await card.locator('.verdict.ok').count() === 1, 'modulo 0, esercizio 1 superato (minuscole, senza punto e virgola)');
check(await page.getByRole('button', { name: 'Esercizio successivo' }).count() === 1, 'compare "Esercizio successivo"');

// JOIN: modulo 7, esercizio 1, con il percorso suggerimento → soluzione
await page.locator('.sidebar .mod').nth(7).click();
card = page.locator('#esercizio');
await card.getByRole('button', { name: 'Verifica' }).click();
check(await card.locator('.verdict.ko').count() === 1, 'modulo 7: il codice iniziale non passa');
await card.getByRole('button', { name: 'Suggerimento' }).click();
check(await card.locator('.hints li').count() === 1, 'il suggerimento si apre');
await card.getByRole('button', { name: /^Soluzione$/ }).click();
await card.getByRole('button', { name: 'Mostra soluzione' }).click();
await card.getByRole('button', { name: "Copia nell'editor" }).click();
await card.getByRole('button', { name: 'Verifica' }).click();
check(await card.locator('.verdict.ok').count() === 1, 'modulo 7: la soluzione copiata passa');

// Modifica dei dati: modulo 11, esercizio 2 (UPDATE senza WHERE)
await page.locator('.sidebar .mod').nth(11).click();
await page.locator('.step').nth(1).click();
card = page.locator('#esercizio');
await card.getByRole('button', { name: 'Verifica' }).click();
check(await card.locator('.verdict.ko').count() === 1, 'modulo 11: UPDATE senza WHERE non passa');
await typeSql(page, card, 'UPDATE Track SET UnitPrice = 1.29 WHERE TrackId = 1;');
await card.getByRole('button', { name: 'Verifica' }).click();
check(await card.locator('.verdict.ok').count() === 1, 'modulo 11: UPDATE con WHERE passa');
// la verifica non deve aver toccato il database degli esempi
await page.locator('.sidebar .mod').nth(1).click();
await page.locator('.esempio').nth(0).getByRole('button', { name: /Prova/ }).click();
check(await page.locator('.esempio').nth(0).locator('table.res').count() === 1, 'gli esempi funzionano dopo una modifica');

// Errore SQL spiegato
card = page.locator('#esercizio');
await typeSql(page, card, 'SELEC Name FROM Artist');
await card.getByRole('button', { name: 'Esegui' }).click();
check(/sintassi/.test(await card.locator('.err').innerText()), 'errore di sintassi spiegato in italiano');

// Schema: inserimento nell'editor
await card.locator('.cm-content').click();
await page.keyboard.press('ControlOrMeta+a'); await page.keyboard.press('Delete');
await page.getByRole('button', { name: 'Schema' }).click();
const drawer = page.getByRole('dialog');
await drawer.waitFor();
check(await drawer.locator('details.tbl').count() === 12, 'lo schema mostra 11 tabelle più i collegamenti');
await drawer.locator('details.tbl', { hasText: 'Invoice' }).first().locator('summary').click();
await drawer.getByRole('button', { name: /^Inserisci "Invoice"/ }).click();
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
check((await card.locator('.cm-content').innerText()).includes('Invoice'), "un clic nello schema inserisce il nome nell'editor");

// Area libera
await page.getByRole('button', { name: 'Area libera' }).click();
await page.getByRole('button', { name: 'Track', exact: true }).click();
check(await page.locator('table.res tbody tr').count() === 20, 'area libera: anteprima di Track');
const sb = page.locator('.sandbox');
await sb.locator('.cm-content').click();
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.insertText("CREATE TABLE Nota (Testo TEXT);\nINSERT INTO Nota VALUES ('ciao');\nSELECT * FROM Nota;");
await sb.getByRole('button', { name: 'Esegui' }).click();
check((await sb.locator('table.res').innerText()).includes('ciao'), 'area libera: più comandi, mostra l\'ultimo risultato');
await sb.getByRole('button', { name: 'Reimposta database' }).click();
await sb.locator('.cm-content').click();
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.insertText('SELECT * FROM Nota;');
await sb.getByRole('button', { name: 'Esegui' }).click();
check(/non esiste/.test(await sb.locator('.err').innerText()), 'Reimposta database cancella le modifiche');

// Memoria dei progressi
await page.reload();
await page.locator('.topbar').waitFor();
check((await page.locator('.overall').innerText()).includes('3/72'), 'dopo il ricaricamento i progressi sono 3/72');
check(errors.length === 0, `nessun errore in console${errors.length ? `: ${errors.join(' | ')}` : ''}`);
check(network.length === 0, `nessuna richiesta di rete${network.length ? `: ${network.join(', ')}` : ''}`);
await ctx.close();

// Layout
for (const [w, h, tag] of [[1280, 900, 'desktop'], [390, 844, 'mobile']]) {
  for (const scheme of ['light', 'dark']) {
    const p = await newPage({ viewport: { width: w, height: h }, colorScheme: scheme });
    await p.page.goto(URL_FILE);
    await p.page.locator('.topbar').waitFor();
    const mod = 7;
    if (tag === 'desktop') await p.page.locator('.sidebar .mod').nth(mod).click();
    else await p.page.locator('#mob-mod').selectOption(String(mod));
    await p.page.locator('.esempio').first().getByRole('button', { name: /Prova/ }).click();
    const c = p.page.locator('#esercizio');
    await c.getByRole('button', { name: 'Verifica' }).click();
    const ov = await p.page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(ov <= 0, `${tag} ${scheme}: nessuno scroll orizzontale (${ov}px)`);
    check(p.errors.length === 0, `${tag} ${scheme}: nessun errore`);
    if (SHOTS) {
      await p.page.screenshot({ path: join(SHOTS, `${tag}-${scheme}-top.png`) });
      await c.scrollIntoViewIfNeeded();
      await c.screenshot({ path: join(SHOTS, `${tag}-${scheme}-esercizio.png`) });
      if (tag === 'desktop' && scheme === 'light') {
        await p.page.getByRole('button', { name: 'Schema' }).click();
        await p.page.getByRole('dialog').locator('details.tbl').first().locator('summary').click();
        await p.page.waitForTimeout(400);
        await p.page.screenshot({ path: join(SHOTS, 'schema.png') });
      }
    }
    await p.ctx.close();
  }
}
await browser.close();
console.log(fails ? `\n${fails} controlli falliti` : '\nTutti i controlli superati');
process.exit(fails ? 1 : 0);
