/**
 * Correzione degli esercizi SQL: confronta il risultato dello studente con quello
 * della soluzione, eseguita sugli stessi dati. I messaggi spiegano cosa non torna.
 */
import type { Cell, TableResult } from './types';

export interface Verdict {
  ok: boolean;
  titolo: string;
  dettaglio?: string;
}

const EPS = 1e-6;

function sameCell(a: Cell, b: Cell): boolean {
  if (a === null || b === null) return a === b;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b))) return true;
    return a.toFixed(2) === b.toFixed(2); // stesso valore arrotondato al centesimo
  }
  if (typeof a === 'number' || typeof b === 'number') return Number(a) === Number(b);
  return String(a).trim() === String(b).trim();
}

function key(row: Cell[]): string {
  return JSON.stringify(row.map((c) => (typeof c === 'number' ? Number(c.toFixed(6)) : c)));
}

function show(row: Cell[]): string {
  return row.map((c) => (c === null ? 'NULL' : typeof c === 'number' ? String(Number(c.toFixed(4))) : String(c))).join(' · ');
}

export function gradeSql(student: TableResult, expected: TableResult, ordered: boolean): Verdict {
  const norm = (s: string) => s.trim().toLowerCase();
  const sCols = student.columns.map(norm);
  const eCols = expected.columns.map(norm);

  const missing = expected.columns.filter((c) => !sCols.includes(norm(c)));
  const extra = student.columns.filter((c) => !eCols.includes(norm(c)));
  if (missing.length) {
    return {
      ok: false,
      titolo: missing.length === 1 ? `Manca la colonna ${missing[0]}` : `Mancano le colonne ${missing.join(', ')}`,
      dettaglio: extra.length
        ? `Hai invece ${extra.join(', ')}. Se il calcolo è giusto, rinomina la colonna con AS.`
        : `${missing.length === 1 ? 'Aggiungila' : 'Aggiungile'} al SELECT con il nome esatto (usa AS per rinominare).`,
    };
  }
  if (extra.length) {
    return { ok: false, titolo: `Ci sono colonne in più: ${extra.join(', ')}`, dettaglio: `L'esercizio chiede solo: ${expected.columns.join(', ')}.` };
  }

  // Riordina le colonne dello studente come quelle attese.
  const idx = eCols.map((c) => sCols.indexOf(c));
  const sRows = student.rows.map((r) => idx.map((i) => r[i]));
  const eRows = expected.rows;

  if (sRows.length !== eRows.length) {
    const more = sRows.length > eRows.length;
    return {
      ok: false,
      titolo: `Il risultato ha ${sRows.length} righe, ne servono ${eRows.length}`,
      dettaglio: more
        ? 'Hai troppe righe: manca un filtro (WHERE o HAVING), un raggruppamento, oppure una JOIN sta duplicando i dati.'
        : 'Hai meno righe del previsto: forse un filtro è troppo restrittivo, oppure serve una LEFT JOIN al posto della JOIN.',
    };
  }

  const equalRows = (a: Cell[], b: Cell[]) => a.every((c, i) => sameCell(c, b[i]));
  const firstDiff = (a: Cell[][], b: Cell[][]) => a.findIndex((r, i) => !equalRows(r, b[i]));

  if (ordered) {
    const d = firstDiff(sRows, eRows);
    if (d === -1) return { ok: true, titolo: 'Esatto!' };
    const sortedEq = firstDiff([...sRows].sort((x, y) => key(x).localeCompare(key(y))), [...eRows].sort((x, y) => key(x).localeCompare(key(y)))) === -1;
    if (sortedEq) return { ok: false, titolo: 'I valori sono giusti, ma l\'ordine no', dettaglio: 'Controlla ORDER BY: colonna e direzione (ASC o DESC).' };
    return { ok: false, titolo: `La riga ${d + 1} è diversa`, dettaglio: `Atteso: ${show(eRows[d])}\nTrovato: ${show(sRows[d])}` };
  }

  const sSorted = [...sRows].sort((x, y) => key(x).localeCompare(key(y)));
  const eSorted = [...eRows].sort((x, y) => key(x).localeCompare(key(y)));
  const d = firstDiff(sSorted, eSorted);
  if (d === -1) return { ok: true, titolo: 'Esatto!' };
  const wrong = eSorted.find((r) => !sSorted.some((s) => equalRows(s, r)));
  return {
    ok: false,
    titolo: 'Alcuni valori non tornano',
    dettaglio: wrong ? `Per esempio manca questa riga: ${show(wrong)}` : `Esempio di riga diversa: ${show(sSorted[d])}`,
  };
}
