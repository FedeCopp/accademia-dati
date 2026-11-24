/**
 * Esecuzione delle query con sql.js (SQLite in WebAssembly) e correzione degli esercizi.
 * Usato sia dall'interfaccia sia dal verificatore in Node.
 */
import { gradeTable } from './grade.js';

/** Errori SQLite più comuni, spiegati in italiano. */
export function traduci(msg) {
  const m = String(msg);
  const regole = [
    [/near "(.+?)": syntax error/, (x) => `Errore di sintassi vicino a "${x[1]}": controlla virgole, parentesi, apici e parole chiave.`],
    [/incomplete input/, () => 'La query si interrompe prima della fine: manca una parentesi, un apice o una parte del comando.'],
    [/no such column: (.+)/, (x) => `La colonna ${x[1]} non esiste: controlla il nome nel pannello Schema (maiuscole e minuscole non contano, gli spazi sì).`],
    [/no such table: (.+)/, (x) => `La tabella ${x[1]} non esiste: i nomi delle tabelle di Chinook sono in inglese e al singolare (Track, Album, Customer…).`],
    [/ambiguous column name: (.+)/, (x) => `La colonna ${x[1]} esiste in più tabelle: scrivi anche l'alias, per esempio t.${x[1]}.`],
    [/misuse of aggregate/, () => 'Una funzione come SUM o COUNT è nel posto sbagliato: nel WHERE non si può usare, serve HAVING.'],
    [/misuse of window function/, () => 'Una window function non si può usare nel WHERE: calcolala in una CTE e filtra fuori.'],
    [/table (.+) already exists/, (x) => `La tabella ${x[1]} esiste già. Nell'area libera premi "Reimposta database" per ricominciare.`],
    [/UNIQUE constraint failed/, () => 'Stai inserendo un valore che esiste già in una colonna che deve essere unica (spesso la chiave primaria).'],
    [/no such function: (.+)/, (x) => `La funzione ${x[1]} non esiste in SQLite.`],
  ];
  for (const [re, fn] of regole) {
    const x = re.exec(m);
    if (x) return `${fn(x)}\n(${m})`;
  }
  return m;
}

/** Converte i valori di sql.js (Uint8Array per i BLOB) in qualcosa di mostrabile. */
const cell = (v) => (v instanceof Uint8Array ? `[${v.length} byte]` : v);

/**
 * Esegue uno o più comandi. Restituisce l'ultimo risultato con righe, oppure un riepilogo
 * delle modifiche se nessun comando restituisce righe.
 */
export function run(db, sql) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const text = String(sql ?? '').trim();
  const solo = text.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const ms = () => (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  if (!solo) return { ok: false, error: 'La query è vuota: scrivi un comando SQL nell\'editor.', ms: 0 };
  try {
    // Istruzione per istruzione: così una SELECT senza righe conserva i nomi delle colonne.
    let table = null;
    let changed = 0;
    for (const stmt of db.iterateStatements(text)) {
      try {
        const columns = stmt.getColumnNames();
        const rows = [];
        while (stmt.step()) rows.push(stmt.get().map(cell));
        if (columns.length > 0) table = { columns, rows };
        else changed += db.getRowsModified();
      } finally {
        stmt.free();
      }
    }
    return { ok: true, table, changed, ms: ms() };
  } catch (e) {
    return { ok: false, error: traduci(e?.message ?? e), ms: ms() };
  }
}

/**
 * Corregge un esercizio partendo da copie nuove del database.
 * @param {(bytes?: Uint8Array) => any} openDb  crea un database dalla copia originale
 */
export function grade(openDb, ex, studentSql) {
  const tipo = ex.tipo ?? 'query';
  const s = openDb();
  const r = run(s, studentSql);
  if (!r.ok) { s.close(); return { esito: { ok: false, titolo: 'La query ha un errore', dettaglio: "Correggi prima l'errore qui sotto." }, risultato: r }; }
  let studentTable = r.table;
  if (tipo === 'modifica') {
    const c = run(s, ex.controllo);
    studentTable = c.ok ? c.table : null;
  }
  s.close();
  if (!studentTable) {
    return {
      esito: tipo === 'modifica'
        ? { ok: false, titolo: 'La verifica non trova i dati attesi', dettaglio: 'Controlla di aver creato le tabelle e inserito i dati richiesti.' }
        : { ok: false, titolo: 'La query non ha restituito nessuna tabella', dettaglio: 'Serve una SELECT che mostri un risultato.' },
      risultato: r,
    };
  }
  const e = openDb();
  const sol = run(e, ex.soluzione);
  const expected = tipo === 'modifica' ? run(e, ex.controllo).table : sol.table;
  e.close();
  if (!expected) return { esito: { ok: false, titolo: 'Errore nella soluzione di riferimento', dettaglio: "Questo esercizio ha un problema: segnalalo." }, risultato: r };
  return { esito: gradeTable(studentTable, expected, !!ex.ordinato), risultato: r, controllo: tipo === 'modifica' ? studentTable : null };
}
