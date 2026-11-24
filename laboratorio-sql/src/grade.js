/**
 * Correzione degli esercizi: confronta il risultato dello studente con quello della soluzione.
 * Porting di src/lib/runners/grade.ts del sito, con gli stessi messaggi.
 * @typedef {{ columns: string[], rows: any[][] }} Tabella
 * @typedef {{ ok: boolean, titolo: string, dettaglio?: string }} Esito
 */
const EPS = 1e-6;

function sameCell(a, b) {
  if (a === null || b === null) return a === b;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b))) return true;
    return a.toFixed(2) === b.toFixed(2);
  }
  if (typeof a === 'number' || typeof b === 'number') {
    const na = Number(a), nb = Number(b);
    return !Number.isNaN(na) && !Number.isNaN(nb) && sameCell(na, nb);
  }
  return String(a).trim() === String(b).trim();
}

const key = (row) => JSON.stringify(row.map((c) => (typeof c === 'number' ? Number(c.toFixed(6)) : c === null ? null : String(c))));
const show = (row) => row.map((c) => (c === null ? 'NULL' : typeof c === 'number' ? String(Number(c.toFixed(4))) : String(c))).join(' · ');
const sortRows = (rows) => [...rows].sort((x, y) => key(x).localeCompare(key(y)));

/**
 * @param {Tabella} student
 * @param {Tabella} expected
 * @param {boolean} ordered
 * @returns {Esito}
 */
export function gradeTable(student, expected, ordered) {
  const norm = (s) => String(s).trim().toLowerCase();
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
  const idx = eCols.map((c) => sCols.indexOf(c));
  const sRows = student.rows.map((r) => idx.map((i) => r[i]));
  const eRows = expected.rows;
  if (sRows.length !== eRows.length) {
    const more = sRows.length > eRows.length;
    return {
      ok: false,
      titolo: `Il risultato ha ${sRows.length} ${sRows.length === 1 ? 'riga' : 'righe'}, ne ${eRows.length === 1 ? 'serve 1' : `servono ${eRows.length}`}`,
      dettaglio: more
        ? 'Hai troppe righe: manca un filtro (WHERE o HAVING), un raggruppamento o un LIMIT, oppure una JOIN sta duplicando i dati.'
        : 'Hai meno righe del previsto: forse un filtro è troppo restrittivo, oppure serve una LEFT JOIN al posto della JOIN.',
    };
  }
  const equalRows = (a, b) => a.every((c, i) => sameCell(c, b[i]));
  const firstDiff = (a, b) => a.findIndex((r, i) => !equalRows(r, b[i]));
  if (ordered) {
    const d = firstDiff(sRows, eRows);
    if (d === -1) return { ok: true, titolo: 'Esatto!' };
    if (firstDiff(sortRows(sRows), sortRows(eRows)) === -1) {
      return { ok: false, titolo: "I valori sono giusti, ma l'ordine no", dettaglio: 'Controlla ORDER BY: colonne, direzione (ASC o DESC) e criterio per i pari merito.' };
    }
    return { ok: false, titolo: `La riga ${d + 1} è diversa`, dettaglio: `Atteso: ${show(eRows[d])}\nTrovato: ${show(sRows[d])}` };
  }
  const sS = sortRows(sRows), eS = sortRows(eRows);
  if (firstDiff(sS, eS) === -1) return { ok: true, titolo: 'Esatto!' };
  const wrong = eS.find((r) => !sS.some((s) => equalRows(s, r)));
  return { ok: false, titolo: 'Alcuni valori non tornano', dettaglio: wrong ? `Per esempio manca questa riga: ${show(wrong)}` : 'Controlla i calcoli e gli arrotondamenti.' };
}
