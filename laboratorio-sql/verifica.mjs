/**
 * Verifica tutti i contenuti del Laboratorio SQL con sql.js in Node:
 * ogni esempio si esegue senza errori, ogni soluzione supera la correzione,
 * ogni codice iniziale non la supera, e gli esercizi ordinati non hanno pari merito ambigui.
 * Uso: npm run lab:verifica
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { MODULI } from './src/lezioni.js';
import { run, grade } from './src/engine.js';

const require = createRequire(import.meta.url);
const initSqlJs = require('sql.js');
const SQL = await initSqlJs();
const bytes = readFileSync(new URL('./data/chinook.sqlite', import.meta.url));
// Copia nuova a ogni apertura: sql.js scrive nel buffer che riceve.
const openDb = () => new SQL.Database(new Uint8Array(bytes));

let errori = 0, esempi = 0, esercizi = 0;
const ids = new Set();
const ko = (msg) => { errori++; console.log(`✘ ${msg}`); };

for (const m of MODULI) {
  for (const es of m.esempi) {
    esempi++;
    const db = openDb();
    const r = run(db, es.sql);
    db.close();
    if (!r.ok) ko(`${m.id} esempio "${es.titolo}": ${r.error.split('\n')[0]}`);
  }
  for (const ex of m.esercizi) {
    esercizi++;
    if (ids.has(ex.id)) ko(`id duplicato ${ex.id}`);
    ids.add(ex.id);
    const sol = grade(openDb, ex, ex.soluzione);
    if (!sol.esito.ok) ko(`${ex.id} soluzione NON passa: ${sol.esito.titolo} ${sol.esito.dettaglio ?? ''}`);
    const st = grade(openDb, ex, ex.iniziale);
    if (st.esito.ok) ko(`${ex.id} il codice iniziale passa già`);
    const tab = sol.controllo ?? sol.risultato.table;
    if (!tab || tab.rows.length === 0) ko(`${ex.id} la soluzione restituisce 0 righe`);
    if (ex.ordinato && tab) {
      // Con l'ordine che conta, righe identiche nelle colonne di ordinamento renderebbero ambigua la correzione:
      // controllo almeno che non ci siano righe del tutto duplicate.
      const k = tab.rows.map((r) => JSON.stringify(r));
      if (new Set(k).size !== k.length) ko(`${ex.id} righe duplicate in un esercizio ordinato`);
    }
    console.log(`✔ ${ex.id.padEnd(7)} ${String(tab?.rows.length ?? 0).padStart(4)} righe · iniziale: ${st.esito.titolo}`);
  }
}
console.log(`\n${MODULI.length} moduli, ${esempi} esempi, ${esercizi} esercizi: ${errori ? `${errori} problemi` : 'tutto a posto'}`);
process.exit(errori ? 1 : 0);
