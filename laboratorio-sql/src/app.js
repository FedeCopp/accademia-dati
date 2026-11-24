/**
 * Laboratorio SQL: interfaccia. Tutto gira nel browser, anche aperto da file://.
 * Il motore (sql.js), il database Chinook e il codice sono incorporati nel file HTML.
 */
import initSqlJs from 'sql.js/dist/sql-wasm-browser.js';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { sql as sqlLang, SQLite } from '@codemirror/lang-sql';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { MODULI, RELAZIONI } from './lezioni.js';
import { run, grade } from './engine.js';

/* ------------------------------------------------------------------ utilità */
const $ = (sel, el = document) => el.querySelector(sel);
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ICON = {
  play: '<path d="M6 3 20 12 6 21Z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
  x: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
  pencil: '<path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/>',
  right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  left: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
};
const icon = (name, cls = '') => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor');
  s.setAttribute('stroke-width', '2'); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round');
  s.setAttribute('aria-hidden', 'true'); if (cls) s.setAttribute('class', cls);
  s.innerHTML = ICON[name];
  return s;
};
function b64ToBytes(b64) {
  const bin = atob(b64.trim());
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* --------------------------------------------------------- stato salvato */
const KEY = 'labsql-v1';
const store = (() => {
  let data = { passed: [], drafts: {}, pos: { m: 0, e: 0 }, sandbox: '' };
  try { data = { ...data, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { /* storage non disponibile */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage non disponibile */ } };
  return {
    passed: () => new Set(data.passed),
    pass(id) { if (!data.passed.includes(id)) { data.passed.push(id); save(); } },
    draft: (id) => data.drafts[id],
    setDraft(id, code) { if (code === null) delete data.drafts[id]; else data.drafts[id] = code; save(); },
    pos: () => data.pos,
    setPos(m, e) { data.pos = { m, e }; save(); },
    sandbox: () => data.sandbox,
    setSandbox(s) { data.sandbox = s; save(); },
    reset() { data = { passed: [], drafts: {}, pos: { m: 0, e: 0 }, sandbox: '' }; save(); },
  };
})();

/* ------------------------------------------------------------ evidenziazione */
const KW = /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|BETWEEN|LIKE|IS|NULL|AS|ORDER|BY|ASC|DESC|LIMIT|DISTINCT|GROUP|HAVING|JOIN|LEFT|INNER|ON|WITH|CASE|WHEN|THEN|ELSE|END|OVER|PARTITION|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|INTEGER|TEXT|REAL|UNION|ALL)\b/g;
/** Colora una query in HTML (per i blocchi di sola lettura). */
function highlight(code) {
  return esc(code).split('\n').map((line) => {
    const ci = line.indexOf('--');
    const [body, comment] = ci >= 0 ? [line.slice(0, ci), line.slice(ci)] : [line, ''];
    const parts = body.split(/('(?:[^']|'')*')/g).map((p, i) => {
      if (i % 2 === 1) return `<span class="s">${p}</span>`;
      return p.replace(KW, '<span class="k">$1</span>')
        .replace(/\b([A-Za-z_]+)(?=\()/g, '<span class="f">$1</span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="num">$1</span>');
    }).join('');
    return parts + (comment ? `<span class="cm">${comment}</span>` : '');
  }).join('\n');
}
/** Mini-markdown della teoria. */
function renderMd(md) {
  const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const out = [];
  const src = md.trim();
  const re = /```sql\n([\s\S]*?)```/g;
  let last = 0, m;
  const pushText = (txt) => {
    for (const b of txt.split(/\n{2,}/).map((x) => x.trim()).filter(Boolean)) {
      if (b.startsWith('### ')) out.push(`<h3>${inline(b.slice(4))}</h3>`);
      else if (b.split('\n').every((l) => l.startsWith('- '))) out.push(`<ul>${b.split('\n').map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`);
      else out.push(`<p>${inline(b.replace(/\n/g, ' '))}</p>`);
    }
  };
  while ((m = re.exec(src))) { pushText(src.slice(last, m.index)); out.push(`<pre><code>${highlight(m[1].replace(/\n$/, ''))}</code></pre>`); last = re.lastIndex; }
  pushText(src.slice(last));
  return out.join('');
}
const rich = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

/* ----------------------------------------------------------------- editor */
const cmHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword, t.definitionKeyword], color: 'var(--code-kw)' },
  { tag: [t.function(t.variableName), t.standard(t.name)], color: 'var(--code-fn)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--code-str)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--code-num)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: [t.typeName], color: 'var(--code-fn)' },
]);
const cmTheme = EditorView.theme({
  '&': { backgroundColor: 'var(--code-bg)', color: 'var(--code-fg)', fontSize: '0.92rem' },
  '.cm-content': { fontFamily: 'var(--mono)', padding: '12px 0', caretColor: 'var(--code-kw)' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'color-mix(in srgb, var(--code-fg) 35%, transparent)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'rgb(255 255 255 / 0.04)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--code-fg)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--code-kw)', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'rgb(94 234 212 / 0.22) !important' },
  '.cm-placeholder': { color: 'var(--code-comment)' },
}, { dark: true });

let schemaForCm = {};
let activeEditor = null;
function createEditor(parent, doc, { onRun, onVerify, onChange, label }) {
  const keys = Prec.highest(keymap.of([
    { key: 'Mod-Enter', run: () => { onRun?.(); return true; } },
    { key: 'Shift-Mod-Enter', run: () => { onVerify?.(); return true; } },
  ]));
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup, keys, sqlLang({ dialect: SQLite, schema: schemaForCm, upperCaseKeywords: true }),
        cmTheme, syntaxHighlighting(cmHighlight), EditorView.lineWrapping, placeholder('Scrivi qui la query…'),
        EditorView.contentAttributes.of({ 'aria-label': label }),
        EditorView.updateListener.of((u) => { if (u.docChanged) onChange?.(u.state.doc.toString()); if (u.focusChanged && u.view.hasFocus) activeEditor = u.view; }),
      ],
    }),
  });
  activeEditor = view;
  return view;
}
const setDoc = (view, text) => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } });

/* --------------------------------------------------------------- risultati */
function resultView(r, { context = 'query' } = {}) {
  const box = h('div', { class: 'result' });
  if (!r) return box;
  box.append(h('p', { class: 'out-h' }, 'Risultato ', h('span', {}, `· ${Math.max(1, Math.round(r.ms ?? 0))} ms`)));
  if (!r.ok) { box.append(h('pre', { class: 'err', role: 'alert' }, r.error)); return box; }
  if (!r.table) {
    box.append(h('p', { class: 'okmsg' }, r.changed > 0
      ? `Fatto: ${r.changed} ${r.changed === 1 ? 'riga modificata' : 'righe modificate'}. Aggiungi una SELECT per vedere il risultato.`
      : context === 'sandbox' ? 'Comando eseguito. Nessuna tabella da mostrare.' : 'Comando eseguito, ma non restituisce righe. Ti serve una SELECT?'));
    return box;
  }
  const { columns, rows } = r.table;
  const MAX = 200;
  const fmt = (c) => (c === null ? 'NULL' : typeof c === 'number' ? (Number.isInteger(c) ? String(c) : String(Number(c.toFixed(6)))) : String(c));
  const tbl = h('table', { class: 'res' },
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col' }, c)))),
    h('tbody', {}, rows.slice(0, MAX).map((row) => h('tr', {}, row.map((c) => h('td', { class: c === null ? 'null' : typeof c === 'number' ? 'n' : '', title: c === null ? '' : String(c) }, fmt(c)))))));
  box.append(h('div', { class: 'twrap', tabindex: '0', 'aria-label': 'Tabella dei risultati' }, tbl));
  box.append(h('p', { class: 'rmeta' }, `${rows.length} ${rows.length === 1 ? 'riga' : 'righe'} · ${columns.length} ${columns.length === 1 ? 'colonna' : 'colonne'}${rows.length > MAX ? ` · mostrate le prime ${MAX}` : ''}${r.changed ? ` · ${r.changed} righe modificate prima` : ''}`));
  if (rows.length === 0) box.append(h('p', { class: 'okmsg' }, 'La query è corretta ma non trova nessuna riga: controlla le condizioni del WHERE.'));
  return box;
}
function verdictView(esito) {
  const ok = esito.ok;
  const svg = ok
    ? (() => { const s = icon('check'); s.querySelector('path').setAttribute('class', 'draw'); s.setAttribute('stroke-width', '2.6'); return s; })()
    : icon('x');
  svg.setAttribute('width', '22'); svg.setAttribute('height', '22');
  return h('div', { class: `verdict ${ok ? 'ok' : 'ko'}` },
    h('span', { class: 'vi' }, svg),
    h('div', {}, h('b', {}, `${ok ? 'Superato' : 'Non ancora'} · ${esito.titolo}`), esito.dettaglio ? h('p', {}, esito.dettaglio) : null));
}

/* --------------------------------------------------------------------- app */
let SQL, DB_BYTES, sandboxDb;
const openDb = () => new SQL.Database(new Uint8Array(DB_BYTES)); // copia nuova: sql.js scrive nel buffer
const TOTAL = MODULI.reduce((n, m) => n + m.esercizi.length, 0);
const state = { view: 'lezione', m: 0, e: 0, attempts: {}, hints: {}, showSol: {}, confirmSol: {}, last: {} };

function toast(msg) {
  let el = $('.toast');
  if (!el) { el = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function topbar() {
  const passed = store.passed().size;
  return h('header', { class: 'topbar' },
    h('div', { class: 'brand' }, icon('db'), h('span', {}, 'Laboratorio ', h('b', {}, 'SQL')), h('small', {}, '· SQLite + Chinook')),
    h('div', { class: 'overall', title: 'Esercizi superati' },
      h('span', { class: 'lbl' }, 'Esercizi'), h('span', {}, `${passed}/${TOTAL}`),
      h('span', { class: 'bar', role: 'progressbar', 'aria-label': 'Esercizi superati', 'aria-valuemin': '0', 'aria-valuemax': String(TOTAL), 'aria-valuenow': String(passed) },
        h('i', { style: `transform: scaleX(${passed / TOTAL})` }))),
    h('button', { class: 'tbtn', type: 'button', 'aria-pressed': state.view === 'sandbox' ? 'true' : 'false', onclick: () => go(state.view === 'sandbox' ? 'lezione' : 'sandbox') }, icon('pencil'), h('span', { class: 'lbl' }, 'Area libera')),
    h('button', { class: 'tbtn', type: 'button', 'aria-haspopup': 'dialog', onclick: openSchema }, icon('db'), h('span', { class: 'lbl' }, 'Schema')),
    h('button', { class: 'tbtn icon', type: 'button', 'aria-label': 'Cambia tema chiaro o scuro', onclick: toggleTheme }, icon('sun', 'ico-sun'), icon('moon', 'ico-moon')));
}

function sidebar() {
  const passed = store.passed();
  return h('nav', { class: 'sidebar', 'aria-label': 'Moduli' },
    h('p', { class: 'side-h' }, 'Percorso'),
    h('ol', { class: 'mods' }, MODULI.map((m, i) => {
      const n = m.esercizi.filter((e) => passed.has(e.id)).length;
      const done = n === m.esercizi.length && n > 0;
      return h('li', {}, h('button', {
        type: 'button', class: `mod${done ? ' done' : ''}`, 'aria-current': state.view === 'lezione' && state.m === i ? 'page' : false,
        onclick: () => { state.m = i; state.e = firstOpen(i); go('lezione'); },
      }, h('span', { class: 'n' }, done ? icon('check') : String(i)), h('span', { class: 't' }, h('b', {}, m.titolo), h('small', {}, m.sottotitolo)), h('span', { class: 'c' }, `${n}/${m.esercizi.length}`)));
    })),
    h('div', { class: 'side-extra' },
      h('p', {}, 'I progressi restano salvati in questo browser.'),
      h('button', { class: 'link', type: 'button', onclick: resetProgress }, icon('reset'), 'Azzera i progressi')));
}

function firstOpen(mi) {
  const passed = store.passed();
  const i = MODULI[mi].esercizi.findIndex((e) => !passed.has(e.id));
  return i < 0 ? 0 : i;
}
let resetArmed = false;
function resetProgress(ev) {
  const btn = ev.currentTarget;
  if (!resetArmed) { resetArmed = true; btn.lastChild.textContent = 'Clicca di nuovo per confermare'; setTimeout(() => { resetArmed = false; btn.lastChild.textContent = 'Azzera i progressi'; }, 4000); return; }
  resetArmed = false; store.reset(); state.attempts = {}; state.hints = {}; state.showSol = {}; state.last = {}; state.m = 0; state.e = 0; render(); toast('Progressi azzerati');
}

function mobileNav() {
  const sel = h('select', { id: 'mob-mod', onchange: (e) => { state.m = Number(e.target.value); state.e = firstOpen(state.m); go('lezione'); } },
    MODULI.map((m, i) => h('option', { value: String(i), selected: i === state.m && state.view === 'lezione' }, `${i}. ${m.titolo}`)));
  return h('div', { class: 'mob-nav' }, h('label', { for: 'mob-mod' }, 'Modulo'), sel);
}

function lessonView() {
  const m = MODULI[state.m];
  const passed = store.passed();
  const content = h('div', { class: 'content' });
  content.append(mobileNav());
  content.append(h('header', { class: 'head' },
    h('span', { class: 'eyebrow' }, `Modulo ${state.m} di ${MODULI.length - 1}`),
    h('h1', {}, m.titolo), h('p', {}, m.sottotitolo)));
  content.append(h('section', { class: 'teoria', html: renderMd(m.teoria), 'aria-label': 'Spiegazione' }));

  if (m.esempi.length) {
    content.append(h('section', { 'aria-labelledby': 'h-esempi' },
      h('h2', { class: 'section-h', id: 'h-esempi' }, 'Esempi', h('span', { class: 'badge' }, String(m.esempi.length))),
      h('div', { class: 'esempi' }, m.esempi.map((es) => exampleCard(es)))));
  }

  const ex = m.esercizi[state.e];
  const steps = h('div', { class: 'steps', role: 'list', 'aria-label': 'Esercizi del modulo' }, m.esercizi.map((e, i) =>
    h('button', { type: 'button', role: 'listitem', class: `step${passed.has(e.id) ? ' done' : ''}`, 'aria-current': i === state.e ? 'step' : false,
      'aria-label': `Esercizio ${i + 1}${passed.has(e.id) ? ', superato' : ''}`, onclick: () => { state.e = i; store.setPos(state.m, i); render(); $('#esercizio')?.scrollIntoView({ block: 'start' }); } },
    passed.has(e.id) ? icon('check') : null, String(i + 1))));
  content.append(h('section', { id: 'esercizi', 'aria-labelledby': 'h-esercizi' },
    h('h2', { class: 'section-h', id: 'h-esercizi' }, 'Esercizi', h('span', { class: 'badge' }, `${m.esercizi.filter((e) => passed.has(e.id)).length}/${m.esercizi.length} superati`)),
    steps, exerciseCard(ex, state.e, m.esercizi.length)));

  content.append(h('nav', { class: 'module-nav', 'aria-label': 'Moduli vicini' },
    state.m > 0 ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { state.m--; state.e = firstOpen(state.m); go('lezione'); } }, icon('left'), `Modulo ${state.m - 1}: ${MODULI[state.m - 1].titolo}`) : h('span'),
    state.m < MODULI.length - 1 ? h('button', { class: 'btn btn-ghost', type: 'button', onclick: () => { state.m++; state.e = firstOpen(state.m); go('lezione'); } }, `Modulo ${state.m + 1}: ${MODULI[state.m + 1].titolo}`, icon('right')) : h('span')));
  return content;
}

function exampleCard(es) {
  const out = h('div', { class: 'out' });
  const tryIt = () => { const db = openDb(); const r = run(db, es.sql); db.close(); out.replaceChildren(resultView(r)); };
  return h('article', { class: 'esempio' },
    h('header', {}, h('h3', {}, es.titolo),
      h('div', { class: 'actions' },
        h('button', { class: 'btn btn-primary btn-sm', type: 'button', onclick: tryIt, 'aria-label': `Prova l'esempio: ${es.titolo}` }, icon('play'), 'Prova'),
        h('button', { class: 'link', type: 'button', onclick: () => { store.setSandbox(es.sql); go('sandbox'); toast("Esempio copiato nell'area libera"); } }, icon('pencil'), 'Modifica'))),
    h('pre', { class: 'code-ro' }, h('code', { html: highlight(es.sql) })),
    es.nota ? h('p', { class: 'nota', html: rich(es.nota) }) : null,
    out);
}

function exerciseCard(ex, idx, total) {
  const id = ex.id;
  const passed = store.passed().has(id);
  const card = h('article', { class: `esercizio${passed ? ' passed' : ''}`, id: 'esercizio', 'aria-labelledby': `t-${id}` });
  const status = h('div', { 'aria-live': 'polite' });
  const output = h('div');
  const hintsBox = h('div');
  const solBox = h('div');
  let view;

  const doRun = () => {
    const db = openDb();
    const r = run(db, view.state.doc.toString());
    db.close();
    status.replaceChildren(); output.replaceChildren(resultView(r));
  };
  const doVerify = () => {
    const { esito, risultato, controllo } = grade(openDb, ex, view.state.doc.toString());
    state.attempts[id] = (state.attempts[id] ?? 0) + 1;
    status.replaceChildren(verdictView(esito));
    output.replaceChildren(resultView(controllo ? { ...risultato, table: controllo } : risultato));
    if (esito.ok) {
      const first = !store.passed().has(id);
      store.pass(id);
      card.classList.add('passed');
      $('.pill', card).className = 'pill ok'; $('.pill', card).replaceChildren(icon('check'), 'Superato');
      refreshChrome();
      if (first) {
        const nextBtn = idx < total - 1
          ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { state.e = idx + 1; store.setPos(state.m, state.e); render(); $('#esercizio')?.scrollIntoView({ block: 'start' }); } }, 'Esercizio successivo', icon('right'))
          : state.m < MODULI.length - 1
            ? h('button', { class: 'btn btn-primary', type: 'button', onclick: () => { state.m++; state.e = firstOpen(state.m); go('lezione'); } }, `Passa al modulo ${state.m + 1}`, icon('right'))
            : h('p', { class: 'okmsg' }, 'Hai completato tutto il laboratorio. Complimenti!');
        status.append(h('div', { class: 'next-row' }, nextBtn));
      }
    }
    updateSolButton();
  };

  const hints = () => state.hints[id] ?? 0;
  const renderHints = () => {
    hintsBox.replaceChildren(hints() ? h('ol', { class: 'hints' }, ex.suggerimenti.slice(0, hints()).map((s) => h('li', { html: rich(s) }))) : '');
    hintBtn.disabled = hints() >= ex.suggerimenti.length;
    hintBtn.lastChild.textContent = hints() === 0 ? 'Suggerimento' : hints() < ex.suggerimenti.length ? 'Altro suggerimento' : 'Suggerimenti finiti';
  };
  const hintBtn = h('button', { class: 'link', type: 'button', onclick: () => { state.hints[id] = Math.min(hints() + 1, ex.suggerimenti.length); renderHints(); } }, icon('bulb'), 'Suggerimento');

  const solBtn = h('button', { class: 'link', type: 'button' }, icon('eye'), 'Soluzione');
  const canSee = () => (state.attempts[id] ?? 0) >= 2 || store.passed().has(id) || state.confirmSol[id];
  const updateSolButton = () => { solBtn.lastChild.textContent = state.showSol[id] ? 'Nascondi soluzione' : canSee() ? 'Mostra soluzione' : 'Soluzione'; };
  solBtn.addEventListener('click', () => {
    if (state.showSol[id]) { state.showSol[id] = false; solBox.replaceChildren(); updateSolButton(); return; }
    if (!canSee()) {
      state.confirmSol[id] = true;
      solBox.replaceChildren(h('p', { class: 'note' }, `Hai fatto ${state.attempts[id] ?? 0} tentativi. Riprovare ancora una volta aiuta a ricordare. Se vuoi comunque vederla, clicca su "Mostra soluzione".`));
      updateSolButton(); return;
    }
    state.showSol[id] = true;
    solBox.replaceChildren(h('div', { class: 'solution' }, h('p', { class: 'out-h' }, 'Soluzione proposta'),
      h('pre', { class: 'code-ro' }, h('code', { html: highlight(ex.soluzione) })),
      h('button', { class: 'link', type: 'button', onclick: () => setDoc(view, ex.soluzione) }, icon('pencil'), "Copia nell'editor")));
    updateSolButton();
  });

  const editorBox = h('div', { class: 'editor' });
  card.append(
    h('div', { class: 'es-top' },
      h('div', {}, h('p', { class: 'meta' }, `Esercizio ${idx + 1} di ${total}${ex.tipo === 'modifica' ? ' · modifica i dati' : ''}${ex.ordinato ? " · l'ordine conta" : ''}`), h('h3', { id: `t-${id}` }, ex.titolo)),
      h('span', { class: `pill${passed ? ' ok' : ''}` }, passed ? icon('check') : null, passed ? 'Superato' : 'Da fare')),
    h('p', { class: 'consegna', html: rich(ex.consegna) }),
    editorBox,
    h('div', { class: 'actions' },
      h('button', { class: 'btn btn-ghost', type: 'button', onclick: doRun, 'aria-keyshortcuts': 'Control+Enter' }, icon('play'), 'Esegui'),
      h('button', { class: 'btn btn-primary', type: 'button', onclick: doVerify }, icon('check'), 'Verifica'),
      h('span', { class: 'spacer' }),
      ex.suggerimenti.length ? hintBtn : null, solBtn,
      h('button', { class: 'link', type: 'button', onclick: () => { setDoc(view, ex.iniziale); store.setDraft(id, null); status.replaceChildren(); output.replaceChildren(); } }, icon('undo'), 'Ripristina')),
    h('p', { class: 'kbd' }, 'Scorciatoie: ', h('kbd', {}, 'Ctrl'), '+', h('kbd', {}, 'Invio'), ' esegue, ', h('kbd', {}, 'Ctrl'), '+', h('kbd', {}, 'Maiusc'), '+', h('kbd', {}, 'Invio'), ' verifica.'),
    hintsBox, solBox, status, output);

  let saveT;
  view = createEditor(editorBox, store.draft(id) ?? ex.iniziale, {
    onRun: doRun, onVerify: doVerify, label: `Editor SQL, esercizio ${idx + 1}: ${ex.titolo}`,
    onChange: (code) => { clearTimeout(saveT); saveT = setTimeout(() => store.setDraft(id, code === ex.iniziale ? null : code), 400); },
  });
  renderHints(); updateSolButton();
  return card;
}

function sandboxView() {
  const content = h('div', { class: 'content sandbox' });
  const out = h('div');
  let view;
  const exec = () => { const r = run(sandboxDb, view.state.doc.toString()); out.replaceChildren(resultView(r, { context: 'sandbox' })); };
  const tables = Object.keys(schemaForCm);
  content.append(
    h('header', { class: 'head' }, h('span', { class: 'eyebrow' }, 'Area libera'), h('h1', {}, 'Prova quello che vuoi'),
      h('p', {}, 'Un editor senza esercizi, collegato al database Chinook. Qui le modifiche (INSERT, UPDATE, DELETE, CREATE) restano finché non reimposti il database.')),
    h('div', { class: 'chips', 'aria-label': 'Anteprima di una tabella' }, tables.map((tn) => h('button', { class: 'chip', type: 'button', onclick: () => { setDoc(view, `SELECT *\nFROM ${tn}\nLIMIT 20;`); exec(); } }, tn))));
  const editorBox = h('div', { class: 'editor' });
  content.append(editorBox,
    h('div', { class: 'actions' },
      h('button', { class: 'btn btn-primary', type: 'button', onclick: exec }, icon('play'), 'Esegui'),
      h('span', { class: 'spacer' }),
      h('button', { class: 'link', type: 'button', onclick: () => { sandboxDb.close(); sandboxDb = openDb(); out.replaceChildren(); toast('Database riportato allo stato iniziale'); } }, icon('reset'), 'Reimposta database'),
      h('button', { class: 'link', type: 'button', onclick: () => go('lezione') }, icon('left'), 'Torna alle lezioni')),
    h('p', { class: 'kbd' }, h('kbd', {}, 'Ctrl'), '+', h('kbd', {}, 'Invio'), ' esegue. Puoi scrivere più comandi separati da ";": vedi il risultato dell\'ultimo.'),
    out);
  view = createEditor(editorBox, store.sandbox() || 'SELECT *\nFROM Artist\nLIMIT 10;', {
    onRun: exec, label: 'Editor SQL, area libera',
    onChange: (code) => store.setSandbox(code),
  });
  return content;
}

/* ------------------------------------------------------------ pannello schema */
let schemaInfo = [];
function buildSchema() {
  const db = openDb();
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0].values.map((r) => r[0]);
  const fks = new Set(RELAZIONI.map(([a]) => a));
  schemaInfo = tables.map((name) => {
    const cols = db.exec(`PRAGMA table_info("${name}")`)[0].values.map(([, col, type, , , pk]) => ({ col, type, pk: pk > 0, fk: fks.has(`${name}.${col}`) }));
    const n = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0];
    return { name, cols, n };
  });
  db.close();
  schemaForCm = Object.fromEntries(schemaInfo.map((s) => [s.name, s.cols.map((c) => c.col)]));
}
function insertAtCursor(text) {
  const v = activeEditor;
  if (!v || !document.body.contains(v.dom)) { toast('Apri un esercizio o l\'area libera per inserire il nome'); return; }
  const { from, to } = v.state.selection.main;
  v.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length } });
  toast(`Inserito: ${text}`);
}
function openSchema() {
  const bg = h('div', { class: 'drawer-bg', onclick: closeSchema });
  const panel = h('aside', { class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'schema-t' },
    h('header', {}, h('h2', { id: 'schema-t' }, 'Schema di Chinook'), h('button', { class: 'tbtn icon', type: 'button', 'aria-label': 'Chiudi lo schema', onclick: closeSchema }, icon('close'))),
    h('div', { class: 'body' },
      h('p', { class: 'hint' }, 'Clicca su una tabella o su una colonna per inserirne il nome nell\'editor. ', h('span', { class: 'pk' }, '●'), ' chiave primaria, ', h('span', { class: 'fk' }, '→'), ' collegamento a un\'altra tabella.'),
      schemaInfo.map((s) => h('details', { class: 'tbl' },
        h('summary', {}, h('span', {}, s.name), h('small', {}, `${s.n.toLocaleString('it-IT')} righe`)),
        h('ul', { class: 'cols' },
          h('li', {}, h('button', { class: 'col', type: 'button', onclick: () => insertAtCursor(s.name) }, h('span', {}, `Inserisci "${s.name}"`), h('small', {}, 'tabella'))),
          s.cols.map((c) => h('li', {}, h('button', { class: 'col', type: 'button', onclick: () => insertAtCursor(c.col) },
            h('span', {}, c.pk ? h('span', { class: 'pk', 'aria-label': 'chiave primaria' }, '● ') : null, c.col, c.fk ? h('span', { class: 'fk', 'aria-label': 'chiave esterna' }, ' →') : null),
            h('small', {}, c.type || '—'))))))),
      h('details', { class: 'tbl', open: true }, h('summary', {}, 'Come si collegano le tabelle'),
        h('div', { class: 'rel', style: 'padding: 10px 12px' }, RELAZIONI.map(([a, b]) => h('div', {}, `${a} → ${b}`))))));
  document.body.append(bg, panel);
  requestAnimationFrame(() => { bg.classList.add('open'); panel.classList.add('open'); $('button', panel).focus(); });
  panel._prev = document.activeElement;
  document.addEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeSchema(); }
function closeSchema() {
  const panel = $('.drawer'), bg = $('.drawer-bg');
  if (!panel) return;
  panel.classList.remove('open'); bg.classList.remove('open');
  document.removeEventListener('keydown', escClose);
  setTimeout(() => { panel.remove(); bg.remove(); }, 300);
}

/* ------------------------------------------------------------------ rendering */
function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('labsql-tema', root.dataset.theme); } catch { /* ignora */ }
}
function refreshChrome() {
  $('.topbar')?.replaceWith(topbar());
  $('.sidebar')?.replaceWith(sidebar());
  const steps = document.querySelectorAll('.step');
  const passed = store.passed();
  MODULI[state.m].esercizi.forEach((e, i) => steps[i]?.classList.toggle('done', passed.has(e.id)));
}
function go(view) {
  state.view = view;
  if (view === 'lezione') store.setPos(state.m, state.e);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function render() {
  const app = $('#app');
  app.removeAttribute('aria-busy');
  const main = h('main', { id: 'principale', tabindex: '-1' }, state.view === 'sandbox' ? sandboxView() : lessonView());
  app.replaceChildren(topbar(), h('div', { class: 'layout' }, sidebar(), main));
  document.title = state.view === 'sandbox' ? 'Area libera · Laboratorio SQL' : `${MODULI[state.m].titolo} · Laboratorio SQL`;
}

/* ------------------------------------------------------------------- avvio */
(async function boot() {
  try {
    SQL = await initSqlJs({ wasmBinary: b64ToBytes($('#wasm-b64').textContent) });
    DB_BYTES = b64ToBytes($('#db-b64').textContent);
    $('#wasm-b64').remove(); $('#db-b64').remove();
    sandboxDb = openDb();
    buildSchema();
    const pos = store.pos();
    state.m = Math.min(Math.max(pos.m ?? 0, 0), MODULI.length - 1);
    state.e = Math.min(Math.max(pos.e ?? 0, 0), MODULI[state.m].esercizi.length - 1);
    render();
  } catch (e) {
    $('#app').replaceChildren(h('div', { class: 'boot' }, h('p', { role: 'alert' }, `Non riesco ad avviare il database: ${e?.message ?? e}`), h('p', {}, 'Prova con una versione aggiornata di Chrome, Firefox, Edge o Safari.')));
  }
})();
