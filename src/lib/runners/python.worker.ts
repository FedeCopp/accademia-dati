/// <reference lib="webworker" />
/**
 * Worker Python: Pyodide (CPython in WebAssembly) caricato da jsDelivr.
 * Esegue il codice dello studente in uno spazio dei nomi nuovo a ogni esecuzione,
 * poi i test nascosti, poi raccoglie l'output e i grafici matplotlib.
 */
const PYODIDE = 'https://cdn.jsdelivr.net/pyodide/v314.0.7/full/';

type Msg =
  | { type: 'init' }
  | { type: 'run'; id: number; code: string; tests: { codice: string; messaggio: string }[]; files: { name: string; text: string }[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodide: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ready: Promise<any> | null = null;

function load() {
  if (!ready) {
    ready = (async () => {
      const mod = await import(/* @vite-ignore */ `${PYODIDE}pyodide.mjs`);
      pyodide = await mod.loadPyodide({ indexURL: PYODIDE });
      pyodide.runPython(`
import os, sys, io, base64, traceback, warnings
os.environ["MPLBACKEND"] = "Agg"
# Gli avvisi interni delle librerie (deprecazioni, backend non interattivo) confondono chi impara.
warnings.simplefilter("ignore", DeprecationWarning)
warnings.simplefilter("ignore", FutureWarning)
warnings.filterwarnings("ignore", message=".*non-interactive.*")
def __figure_pngs():
    if "matplotlib" not in sys.modules:
        return []
    import matplotlib.pyplot as plt
    out = []
    for n in plt.get_fignums():
        buf = io.BytesIO()
        plt.figure(n).savefig(buf, format="png", dpi=110, bbox_inches="tight")
        out.append(base64.b64encode(buf.getvalue()).decode())
    plt.close("all")
    return out
def __format_error(e):
    tb = traceback.extract_tb(e.__traceback__)
    line = None
    for fr in tb:
        if fr.filename == "<exec>":
            line = fr.lineno
    if isinstance(e, SyntaxError):
        line = e.lineno
    return {"tipo": type(e).__name__, "messaggio": str(e), "riga": line}
def __run(code, ns, filename="<exec>"):
    try:
        exec(compile(code, filename, "exec"), ns)
        return None
    except BaseException as e:
        return __format_error(e)
`);
      return pyodide;
    })();
    ready.catch(() => { ready = null; });
  }
  return ready;
}

const traduzioni: Record<string, string> = {
  NameError: 'Usi un nome che non esiste ancora: controlla di averlo definito e di averlo scritto uguale.',
  SyntaxError: 'Errore di sintassi: controlla due punti, parentesi e virgolette.',
  IndentationError: 'Indentazione sbagliata: i blocchi dopo i due punti vanno rientrati di 4 spazi.',
  TypeError: 'Stai usando un tipo di dato sbagliato, per esempio sommando un testo a un numero.',
  KeyError: 'La chiave non esiste nel dizionario o la colonna non esiste nel DataFrame.',
  ValueError: 'Il valore non è valido per questa operazione, per esempio float("abc").',
  ZeroDivisionError: 'Divisione per zero.',
  IndexError: 'Stai leggendo una posizione che non esiste nella lista.',
  AttributeError: 'Questo oggetto non ha il metodo o l\'attributo che stai usando.',
  FileNotFoundError: 'Il file non esiste: controlla il nome.',
  ModuleNotFoundError: 'Questa libreria non è disponibile qui.',
};

self.onmessage = async (ev: MessageEvent<Msg>) => {
  const msg = ev.data;
  if (msg.type === 'init') {
    try { await load(); self.postMessage({ type: 'ready' }); }
    catch (e) { self.postMessage({ type: 'fatal', message: String(e) }); }
    return;
  }
  const t0 = performance.now();
  let stdout = '';
  try {
    const py = await load();
    for (const f of msg.files) py.FS.writeFile(f.name, f.text);
    await py.loadPackagesFromImports(msg.code + '\n' + msg.tests.map((t) => t.codice).join('\n'));
    py.setStdout({ batched: (s: string) => { stdout += s + '\n'; } });
    py.setStderr({ batched: (s: string) => { stdout += s + '\n'; } });
    self.postMessage({ type: 'started', id: msg.id }); // da qui parte il tempo massimo
    const ns = py.globals.get('dict')();
    ns.set('__name__', '__main__');
    const run = py.globals.get('__run');
    const asObj = (r: unknown) => (r ? (r as { toJs: (o: unknown) => Record<string, unknown> }).toJs({ dict_converter: Object.fromEntries }) : null);
    let error: { message: string; line?: number } | undefined;
    const info = asObj(run(msg.code, ns)) as { tipo: string; messaggio: string; riga: number | null } | null;
    if (info) {
      const spiega = traduzioni[info.tipo] ?? '';
      error = { message: `${info.tipo}: ${info.messaggio}${spiega ? `\n${spiega}` : ''}`, line: info.riga ?? undefined };
    }
    let failed: { messaggio: string; dettaglio?: string } | undefined;
    let passed = 0;
    if (!error) {
      for (const t of msg.tests) {
        const ti = asObj(run(t.codice, ns, '<test>')) as { tipo: string; messaggio: string } | null;
        if (ti) {
          failed = { messaggio: t.messaggio, dettaglio: ti.tipo === 'AssertionError' ? (ti.messaggio || undefined) : `${ti.tipo}: ${ti.messaggio}` };
          break;
        }
        passed++;
      }
    }
    const figures = py.runPython('__figure_pngs()').toJs();
    ns.destroy?.(); run.destroy?.();
    self.postMessage({
      type: 'result', id: msg.id,
      result: { ok: !error && !failed, stdout, error, figures: Array.from(figures), failed, testsPassed: passed, testsTotal: msg.tests.length, ms: performance.now() - t0 },
    });
  } catch (e) {
    self.postMessage({ type: 'result', id: msg.id, result: { ok: false, stdout, error: { message: String(e) }, figures: [], ms: performance.now() - t0 } });
  }
};
