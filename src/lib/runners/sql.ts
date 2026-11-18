/**
 * Motore SQL nel browser: DuckDB-WASM (stesso dialetto delle lezioni).
 * Una sola istanza per pagina, creata al primo utilizzo. I file .wasm e il worker
 * sono serviti dal sito (import ?url di Vite): nessuna dipendenza da CDN.
 */
import * as duckdb from '@duckdb/duckdb-wasm';
import wasmUrl from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import workerUrl from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import type { Cell, SqlRunResult, TableResult } from './types';

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
const loaded = new Set<string>();

function dataUrl(name: string) {
  const base = (document.documentElement.dataset.base ?? '').replace(/\/$/, '');
  return `${base}/data/${name}`;
}

export function getSqlEngine(): Promise<duckdb.AsyncDuckDB> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const worker = new Worker(workerUrl);
      const db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
      await db.instantiate(wasmUrl);
      // Numeri interi grandi e decimali come double, date come date: più semplice da confrontare.
      await db.open({ query: { castBigIntToDouble: true, castDecimalToDouble: true, castTimestampToDate: true } });
      return db;
    })();
    dbPromise.catch(() => { dbPromise = null; });
  }
  return dbPromise;
}

/** Registra i CSV richiesti dall'esercizio, così le query possono usare FROM 'comuni.csv'. */
async function ensureFiles(db: duckdb.AsyncDuckDB, files: string[]) {
  for (const f of files) {
    const name = f.endsWith('.csv') ? f : `${f}.csv`;
    if (loaded.has(name)) continue;
    const res = await fetch(dataUrl(name));
    if (!res.ok) throw new Error(`Non trovo il file di dati ${name}`);
    await db.registerFileText(name, await res.text());
    loaded.add(name);
  }
}

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmtDate(v: unknown, withTime: boolean): string | null {
  if (v === null || v === undefined) return null;
  const d = v instanceof Date ? v : new Date(Number(v));
  if (Number.isNaN(d.getTime())) return String(v);
  const day = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  if (!withTime) return day;
  const t = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return t === '00:00:00' ? day : `${day} ${t}`;
}

function normalize(v: unknown, typeName: string): Cell {
  if (v === null || v === undefined) return null;
  if (/^Date/i.test(typeName)) return fmtDate(v, false);
  if (/^Timestamp/i.test(typeName)) return fmtDate(v, true);
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') return v;
  if (v instanceof Date) return fmtDate(v, true);
  return String(v);
}

/** Toglie il "--" e gli spazi finali, e il punto e virgola finale. */
function clean(sql: string) {
  return sql.trim().replace(/;\s*$/, '');
}

/** Riga di errore, se DuckDB la indica ("LINE 3:"). */
function errorLine(message: string): number | undefined {
  const m = /LINE (\d+):/.exec(message);
  return m ? Number(m[1]) : undefined;
}

export async function runSql(sql: string, files: string[]): Promise<SqlRunResult> {
  const t0 = performance.now();
  try {
    const db = await getSqlEngine();
    await ensureFiles(db, files);
    const conn = await db.connect();
    try {
      const text = clean(sql);
      if (!text) return { ok: false, error: { message: 'La query è vuota.' }, ms: 0 };
      const res = await conn.query(text);
      const fields = res.schema.fields;
      const table: TableResult = {
        columns: fields.map((f) => f.name),
        rows: res.toArray().map((row: Record<string, unknown>) => {
          const obj = row && typeof (row as { toJSON?: () => Record<string, unknown> }).toJSON === 'function'
            ? (row as { toJSON: () => Record<string, unknown> }).toJSON()
            : row;
          return fields.map((f) => normalize(obj[f.name], String(f.type)));
        }),
      };
      return { ok: true, table, ms: performance.now() - t0 };
    } finally {
      await conn.close();
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: { message: traduci(message), line: errorLine(message) }, ms: performance.now() - t0 };
  }
}

/** Aggiunge una spiegazione in italiano ai messaggi di errore più frequenti. */
function traduci(msg: string): string {
  const first = msg.split('\n')[0].trim();
  const hints: Array<[RegExp, (m: RegExpExecArray) => string]> = [
    [/syntax error at or near "(.+?)"/, (m) => `Errore di sintassi vicino a ${m[1]}: controlla virgole, parentesi e parole chiave.`],
    [/syntax error at end of input/, () => 'La query si interrompe prima della fine: manca qualcosa dopo l\'ultima parola.'],
    [/Referenced column "(.+?)" not found/, (m) => `La colonna "${m[1]}" non esiste: controlla il nome.`],
    [/Table with name (.+?) does not exist/, (m) => `La tabella ${m[1]} non esiste: per i file usa gli apici, per esempio FROM 'comuni.csv'.`],
    [/No files found that match the pattern "(.+?)"/, (m) => `Il file "${m[1]}" non esiste in questo esercizio.`],
    [/must appear in the GROUP BY clause|must be part of an aggregate/, () => 'Ogni colonna del SELECT deve stare nel GROUP BY oppure dentro una funzione come SUM o COUNT.'],
    [/Ambiguous reference to column name "(.+?)"/, (m) => `La colonna "${m[1]}" esiste in più tabelle: aggiungi l'alias, per esempio c.${m[1]}.`],
  ];
  for (const [re, fn] of hints) {
    const m = re.exec(msg);
    if (m) return `${fn(m)}\n(${first})`;
  }
  return first;
}
