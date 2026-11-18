/**
 * Lato pagina del motore Python: gestisce il worker, il tempo massimo di esecuzione
 * e il caricamento dei file di dati. Un solo worker per pagina, condiviso dagli esercizi.
 */
import type { PyRunResult, PyTest } from './types';

const TIMEOUT_MS = 10_000;
let worker: Worker | null = null;
let readyPromise: Promise<void> | null = null;
let seq = 0;
const fileCache = new Map<string, string>();

function create() {
  worker = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
  readyPromise = new Promise<void>((resolve, reject) => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.data?.type === 'ready') { worker?.removeEventListener('message', onMsg); resolve(); }
      if (ev.data?.type === 'fatal') { worker?.removeEventListener('message', onMsg); reject(new Error(ev.data.message)); }
    };
    worker!.addEventListener('message', onMsg);
    worker!.addEventListener('error', (e) => reject(new Error(e.message || 'Impossibile avviare Python')));
  });
  worker.postMessage({ type: 'init' });
  readyPromise.catch(() => { worker?.terminate(); worker = null; readyPromise = null; });
}

export function getPythonEngine(): Promise<void> {
  if (!readyPromise) create();
  return readyPromise!;
}

async function readFiles(files: string[]) {
  const base = (document.documentElement.dataset.base ?? '').replace(/\/$/, '');
  return Promise.all(files.map(async (f) => {
    const name = f.endsWith('.csv') ? f : `${f}.csv`;
    if (!fileCache.has(name)) {
      const res = await fetch(`${base}/data/${name}`);
      if (!res.ok) throw new Error(`Non trovo il file di dati ${name}`);
      fileCache.set(name, await res.text());
    }
    return { name, text: fileCache.get(name)! };
  }));
}

export async function runPython(code: string, tests: PyTest[], files: string[]): Promise<PyRunResult> {
  await getPythonEngine();
  const payload = await readFiles(files);
  const id = ++seq;
  const w = worker!;
  return new Promise<PyRunResult>((resolve) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (d?.id !== id) return;
      if (d.type === 'started') {
        timer = setTimeout(() => {
          w.removeEventListener('message', onMsg);
          w.terminate(); worker = null; readyPromise = null; // il prossimo "Esegui" riparte da zero
          resolve({ ok: false, stdout: '', figures: [], ms: TIMEOUT_MS, error: { message: `Il codice gira da più di ${TIMEOUT_MS / 1000} secondi ed è stato fermato. C'è un ciclo che non finisce mai?` } });
        }, TIMEOUT_MS);
      }
      if (d.type === 'result') {
        if (timer) clearTimeout(timer);
        w.removeEventListener('message', onMsg);
        resolve(d.result as PyRunResult);
      }
    };
    w.addEventListener('message', onMsg);
    w.postMessage({ type: 'run', id, code, tests, files: payload });
  });
}
