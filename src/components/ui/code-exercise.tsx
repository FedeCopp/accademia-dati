"use client";

import * as React from "react";
import CodeMirror, { EditorView, keymap, type Extension } from "@uiw/react-codemirror";
import { Prec } from "@codemirror/state";
import { sql as sqlLang, PostgreSQL } from "@codemirror/lang-sql";
import { python as pythonLang } from "@codemirror/lang-python";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { markPassed, passedSet, readDraft, writeDraft } from "@/lib/exercises";
import type { PyRunResult, SqlRunResult, TableResult } from "@/lib/runners/types";
import type { Verdict } from "@/lib/runners/grade";
import "@/styles/exercise.css";

export interface Exercise {
  id: string;
  titolo: string;
  consegna: string;
  linguaggio: "sql" | "python";
  dataset: string[];
  iniziale: string;
  soluzione: string;
  ordinato?: boolean;
  test?: { codice: string; messaggio: string }[];
  suggerimenti: string[];
}

type Phase = "idle" | "loading" | "running";
type Output =
  | { kind: "sql"; res: SqlRunResult }
  | { kind: "py"; res: PyRunResult }
  | null;

/* ---------- tema dell'editor, costruito sui token del sito ---------- */
const editorTheme = EditorView.theme({
  "&": { backgroundColor: "var(--code-bg)", color: "var(--code-fg)", fontSize: "0.9rem" },
  ".cm-content": { fontFamily: "var(--font-mono)", padding: "12px 0", caretColor: "var(--code-kw)" },
  ".cm-gutters": { backgroundColor: "var(--code-bg)", color: "color-mix(in srgb, var(--code-fg) 35%, transparent)", border: "none" },
  ".cm-activeLine": { backgroundColor: "rgb(255 255 255 / 0.04)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--code-fg)" },
  "&.cm-focused": { outline: "none" },
  ".cm-cursor": { borderLeftColor: "var(--code-kw)", borderLeftWidth: "2px" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": { backgroundColor: "rgb(94 234 212 / 0.22) !important" },
  ".cm-matchingBracket": { backgroundColor: "rgb(94 234 212 / 0.18)", outline: "none" },
}, { dark: true });

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword, t.modifier, t.controlKeyword, t.definitionKeyword], color: "var(--code-kw)" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.standard(t.name)], color: "var(--code-fn)" },
  { tag: [t.string, t.special(t.string)], color: "var(--code-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--code-num)" },
  { tag: [t.comment, t.lineComment, t.blockComment], color: "var(--code-str)", fontStyle: "italic" },
  { tag: [t.typeName, t.className], color: "var(--code-type)" },
]);

/* ---------- piccole icone SVG (stile Lucide) ---------- */
const I = {
  play: <path d="M6 3 20 12 6 21Z" />,
  check: <path d="M20 6 9 17l-5-5" />,
  bulb: <><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  undo: <><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" /></>,
  x: <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></>,
};
function Svg({ d, size = 16 }: { d: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d}
    </svg>
  );
}

/** Testo con `codice` e **grassetto** inline. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

function ResultTable({ table }: { table: TableResult }) {
  const shown = table.rows.slice(0, 50);
  const fmt = (c: unknown) => (c === null ? "NULL" : typeof c === "number" ? (Number.isInteger(c) ? c.toLocaleString("it-IT") : c.toLocaleString("it-IT", { maximumFractionDigits: 4 })) : String(c));
  return (
    <div className="ex-table-wrap">
      <table className="ex-table">
        <thead><tr>{table.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {shown.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={cn(typeof c === "number" && "num", c === null && "null")}>{fmt(c)}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <p className="ex-meta">
        {table.rows.length} {table.rows.length === 1 ? "riga" : "righe"} · {table.columns.length} {table.columns.length === 1 ? "colonna" : "colonne"}
        {table.rows.length > shown.length ? ` · mostrate le prime ${shown.length}` : ""}
      </p>
    </div>
  );
}

export function CodeExercise({ ex, numero }: { ex: Exercise; numero: number }) {
  const reduce = useReducedMotion();
  const [code, setCode] = React.useState(ex.iniziale);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [engineReady, setEngineReady] = React.useState(false);
  const [output, setOutput] = React.useState<Output>(null);
  const [verdict, setVerdict] = React.useState<Verdict | null>(null);
  const [passed, setPassed] = React.useState(false);
  const [attempts, setAttempts] = React.useState(0);
  const [hints, setHints] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [confirmSolution, setConfirmSolution] = React.useState(false);
  const expectedRef = React.useRef<TableResult | null>(null);
  const codeRef = React.useRef(code);
  codeRef.current = code;

  // Bozza e stato "superato" salvati nel browser.
  React.useEffect(() => {
    const d = readDraft(ex.id);
    if (d !== null) setCode(d);
    setPassed(passedSet().has(ex.id));
  }, [ex.id]);
  React.useEffect(() => {
    const h = setTimeout(() => writeDraft(ex.id, code === ex.iniziale ? null : code), 400);
    return () => clearTimeout(h);
  }, [code, ex.id, ex.iniziale]);

  const isSql = ex.linguaggio === "sql";
  const busy = phase !== "idle";

  const ensureEngine = React.useCallback(async () => {
    if (engineReady) return;
    setPhase("loading");
    if (isSql) await (await import("@/lib/runners/sql")).getSqlEngine();
    else await (await import("@/lib/runners/python")).getPythonEngine();
    setEngineReady(true);
  }, [engineReady, isSql]);

  const execute = React.useCallback(async (grade: boolean) => {
    if (busy) return;
    setVerdict(null);
    try {
      await ensureEngine();
      setPhase("running");
      const src = codeRef.current;
      if (isSql) {
        const { runSql } = await import("@/lib/runners/sql");
        const res = await runSql(src, ex.dataset);
        setOutput({ kind: "sql", res });
        if (grade) {
          setAttempts((a) => a + 1);
          if (!res.ok || !res.table) {
            setVerdict({ ok: false, titolo: "La query non è stata eseguita", dettaglio: "Correggi prima l'errore qui sotto." });
          } else {
            if (!expectedRef.current) {
              const exp = await runSql(ex.soluzione, ex.dataset);
              if (!exp.ok || !exp.table) throw new Error("La soluzione di riferimento non funziona: segnala l'esercizio.");
              expectedRef.current = exp.table;
            }
            const { gradeSql } = await import("@/lib/runners/grade");
            const v = gradeSql(res.table, expectedRef.current, !!ex.ordinato);
            setVerdict(v);
            if (v.ok) { setPassed(true); markPassed(ex.id); }
          }
        }
      } else {
        const { runPython } = await import("@/lib/runners/python");
        const res = await runPython(src, grade ? ex.test ?? [] : [], ex.dataset);
        setOutput({ kind: "py", res });
        if (grade) {
          setAttempts((a) => a + 1);
          if (res.error) setVerdict({ ok: false, titolo: "Il codice si è fermato con un errore", dettaglio: "Correggi prima l'errore qui sotto." });
          else if (res.failed) setVerdict({ ok: false, titolo: res.failed.messaggio, dettaglio: res.failed.dettaglio });
          else { setVerdict({ ok: true, titolo: "Esatto!", dettaglio: res.testsTotal === 1 ? "Il controllo è superato." : `${res.testsTotal} controlli superati su ${res.testsTotal}.` }); setPassed(true); markPassed(ex.id); }
        }
      }
    } catch (e) {
      setVerdict({ ok: false, titolo: "Non riesco ad avviare l'ambiente", dettaglio: `${e instanceof Error ? e.message : String(e)}\nControlla la connessione e riprova.` });
    } finally {
      setPhase("idle");
    }
  }, [busy, ensureEngine, ex, isSql]);

  const runKeys: Extension = React.useMemo(() => Prec.highest(keymap.of([
    { key: "Mod-Enter", run: () => { void execute(false); return true; } },
    { key: "Shift-Mod-Enter", run: () => { void execute(true); return true; } },
  ])), [execute]);

  const extensions = React.useMemo(() => [
    isSql ? sqlLang({ dialect: PostgreSQL, upperCaseKeywords: true }) : pythonLang(),
    editorTheme,
    syntaxHighlighting(highlight),
    EditorView.lineWrapping,
    EditorView.contentAttributes.of({ "aria-label": `Editor ${isSql ? "SQL" : "Python"}, esercizio ${numero}` }),
    runKeys,
  ], [isSql, numero, runKeys]);

  const canShowSolution = attempts >= 2 || passed;
  const loadingLabel = isSql ? "Preparo il database (circa 8 MB la prima volta)…" : "Preparo Python (circa 15 MB la prima volta, poi resta in cache)…";

  return (
    <section className={cn("ex", passed && "is-passed")} aria-labelledby={`ex-${ex.id}-t`}>
      <header className="ex-head">
        <span className="ex-num">{numero}</span>
        <div className="ex-title">
          <h3 id={`ex-${ex.id}-t`}>{ex.titolo}</h3>
          <span className="ex-lang">{isSql ? "SQL · DuckDB" : "Python"}{ex.dataset.length > 0 && ` · ${ex.dataset.map((d) => (d.endsWith(".csv") ? d : `${d}.csv`)).join(", ")}`}</span>
        </div>
        <span className={cn("ex-badge", passed ? "ok" : "todo")}>
          {passed ? <><Svg d={I.check} size={14} /> Superato</> : "Da fare"}
        </span>
      </header>

      <p className="ex-task"><Rich text={ex.consegna} /></p>

      <div className="ex-editor">
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={extensions}
          theme="none"
          basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: true, searchKeymap: false }}
          minHeight="120px"
          maxHeight="420px"
        />
      </div>

      <div className="ex-actions">
        <button type="button" className="btn btn-ghost ex-btn" onClick={() => execute(false)} disabled={busy} aria-keyshortcuts="Control+Enter Meta+Enter">
          <Svg d={I.play} /> Esegui
        </button>
        <button type="button" className="btn btn-primary ex-btn" onClick={() => execute(true)} disabled={busy}>
          <Svg d={I.check} /> Verifica
        </button>
        <span className="ex-spacer" />
        {ex.suggerimenti.length > 0 && (
          <button type="button" className="ex-link" onClick={() => setHints((h) => Math.min(h + 1, ex.suggerimenti.length))} disabled={hints >= ex.suggerimenti.length}>
            <Svg d={I.bulb} /> {hints === 0 ? "Suggerimento" : hints < ex.suggerimenti.length ? "Altro suggerimento" : "Suggerimenti finiti"}
          </button>
        )}
        {!showSolution && (
          canShowSolution || confirmSolution ? (
            <button type="button" className="ex-link" onClick={() => setShowSolution(true)}><Svg d={I.eye} /> Mostra soluzione</button>
          ) : (
            <button type="button" className="ex-link" onClick={() => setConfirmSolution(true)} title="Prova almeno due volte prima di guardarla">
              <Svg d={I.eye} /> Soluzione
            </button>
          )
        )}
        <button type="button" className="ex-link" onClick={() => { setCode(ex.iniziale); setOutput(null); setVerdict(null); writeDraft(ex.id, null); }}>
          <Svg d={I.undo} /> Ripristina
        </button>
      </div>
      <p className="ex-kbd">Scorciatoie: <kbd>Ctrl</kbd>+<kbd>Invio</kbd> esegue, <kbd>Ctrl</kbd>+<kbd>Maiusc</kbd>+<kbd>Invio</kbd> verifica.</p>

      {confirmSolution && !canShowSolution && !showSolution && (
        <p className="ex-note">Hai fatto {attempts} {attempts === 1 ? "tentativo" : "tentativi"}. Provare ancora una volta aiuta a ricordare. Se vuoi comunque vederla, clicca di nuovo su <b>Mostra soluzione</b>.</p>
      )}

      {hints > 0 && (
        <ol className="ex-hints">
          {ex.suggerimenti.slice(0, hints).map((h, i) => <li key={i}><Rich text={h} /></li>)}
        </ol>
      )}

      <div className="ex-status" aria-live="polite">
        {phase === "loading" && <p className="ex-loading"><span className="spinner" aria-hidden="true" />{loadingLabel}</p>}
        {phase === "running" && <p className="ex-loading"><span className="spinner" aria-hidden="true" />Eseguo…</p>}
        {verdict && (
          <motion.div
            key={`${verdict.ok}-${attempts}`}
            className={cn("ex-verdict", verdict.ok ? "ok" : "ko")}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          >
            <span className="ex-verdict-ico">
              {verdict.ok ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <motion.path d="M20 6 9 17l-5-5" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
                </svg>
              ) : <Svg d={I.x} size={22} />}
            </span>
            <div>
              <p className="ex-verdict-t">{verdict.ok ? `Superato · ${verdict.titolo}` : `Non ancora · ${verdict.titolo}`}</p>
              {verdict.dettaglio && <p className="ex-verdict-d">{verdict.dettaglio}</p>}
            </div>
          </motion.div>
        )}
      </div>

      {output && (
        <div className="ex-output">
          <p className="ex-out-h">Risultato{output.res.ms ? <span> · {Math.round(output.res.ms)} ms</span> : null}</p>
          {output.kind === "sql" && (output.res.ok && output.res.table
            ? <ResultTable table={output.res.table} />
            : <pre className="ex-error">{output.res.error?.line ? `Riga ${output.res.error.line}: ` : ""}{output.res.error?.message}</pre>)}
          {output.kind === "py" && (
            <>
              {output.res.stdout && <pre className="ex-stdout">{output.res.stdout}</pre>}
              {output.res.error && <pre className="ex-error">{output.res.error.line ? `Riga ${output.res.error.line}: ` : ""}{output.res.error.message}</pre>}
              {output.res.figures.map((f, i) => <img key={i} className="ex-fig" src={`data:image/png;base64,${f}`} alt={`Grafico ${i + 1} prodotto dal codice`} />)}
              {!output.res.stdout && !output.res.error && output.res.figures.length === 0 && <p className="ex-meta">Il codice è stato eseguito senza stampare nulla. Usa print() per vedere un valore.</p>}
            </>
          )}
        </div>
      )}

      {showSolution && (
        <div className="ex-solution">
          <p className="ex-out-h">Soluzione proposta</p>
          <pre><code>{ex.soluzione}</code></pre>
          <button type="button" className="ex-link" onClick={() => setCode(ex.soluzione)}>Copia nell'editor</button>
        </div>
      )}
    </section>
  );
}

export default CodeExercise;
