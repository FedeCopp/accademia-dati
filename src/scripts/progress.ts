/**
 * Progressi della Fase 1, salvati solo nel browser (localStorage).
 * Ogni elemento interessato dichiara cosa mostrare con attributi data-*:
 *  [data-week-toggle="n"]   bottone "segna come fatta"
 *  [data-week-state="n"]    contenitore che riceve la classe .is-done
 *  [data-progress-count]    testo "x / 12"
 *  [data-progress-bar]      barra (stile width)
 *  [data-progress-meter]    elemento role=progressbar (aria-valuenow)
 *  [data-next-week]         link alla prossima settimana da fare
 */
const KEY = 'accademia-dati-weeks-v1';
const TOTAL = 12;

function read(): Set<number> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}
function write(s: Set<number>) {
  try { localStorage.setItem(KEY, JSON.stringify([...s].sort((a, b) => a - b))); } catch { /* storage bloccato */ }
}

function render() {
  const done = read();
  const count = done.size;

  document.querySelectorAll<HTMLElement>('[data-week-state]').forEach((el) => {
    el.classList.toggle('is-done', done.has(Number(el.dataset.weekState)));
  });
  document.querySelectorAll<HTMLButtonElement>('[data-week-toggle]').forEach((btn) => {
    const isDone = done.has(Number(btn.dataset.weekToggle));
    btn.setAttribute('aria-pressed', String(isDone));
    const label = btn.querySelector('[data-label]');
    if (label) label.textContent = isDone ? (btn.dataset.labelDone ?? 'Fatta') : (btn.dataset.labelTodo ?? 'Segna come fatta');
  });
  document.querySelectorAll<HTMLElement>('[data-progress-count]').forEach((el) => { el.textContent = `${count} / ${TOTAL}`; });
  document.querySelectorAll<HTMLElement>('[data-progress-bar]').forEach((el) => { el.style.width = `${(count / TOTAL) * 100}%`; });
  document.querySelectorAll<HTMLElement>('[data-progress-meter]').forEach((el) => el.setAttribute('aria-valuenow', String(count)));

  let next = 0;
  for (let i = 1; i <= TOTAL; i++) if (!done.has(i)) { next = i; break; }
  document.querySelectorAll<HTMLAnchorElement>('[data-next-week]').forEach((a) => {
    const titles = JSON.parse(a.dataset.titles ?? '{}') as Record<string, string>;
    const base = a.dataset.base ?? '';
    const text = a.querySelector('[data-label]') ?? a;
    if (next) {
      a.href = `${base}/fase-1/settimana-${String(next).padStart(2, '0')}/`;
      text.textContent = `Settimana ${next}: ${titles[next] ?? ''}`;
    } else {
      a.href = `${base}/percorso/#fase-2`;
      text.textContent = 'Fase 1 completata: passa alla Fase 2';
    }
  });
  document.documentElement.dataset.phase1Done = String(count === TOTAL);
}

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-week-toggle]');
  if (btn) {
    const n = Number(btn.dataset.weekToggle);
    const done = read();
    done.has(n) ? done.delete(n) : done.add(n);
    write(done);
    render();
    return;
  }
  const reset = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-progress-reset]');
  if (reset) {
    const msg = document.querySelector<HTMLElement>('[data-reset-msg]');
    if (reset.dataset.armed) {
      write(new Set());
      delete reset.dataset.armed;
      reset.textContent = 'Azzera i progressi';
      if (msg) msg.textContent = 'Progressi azzerati.';
      render();
    } else {
      reset.dataset.armed = '1';
      reset.textContent = 'Conferma: azzera tutto';
      if (msg) msg.textContent = 'Clicca di nuovo per confermare.';
    }
  }
});

render();
