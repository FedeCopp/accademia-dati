/**
 * Progressi della Fase 1, salvati solo nel browser (localStorage).
 * Attributi letti:
 *  [data-week-toggle="n"]  bottone "segna come fatta" (aria-pressed)
 *  [data-week-state="n"]   riceve .is-done e, per la prossima settimana, .is-next
 *  [data-progress-count]   testo "x / 12"      [data-progress-bar]  larghezza della barra
 *  [data-progress-meter]   role=progressbar     [data-progress-pct]  testo "x%"
 *  [data-next-week]        link alla prossima lezione; [data-label] riceve il testo
 *  [data-cta-start]        bottone principale: "Inizia" oppure "Continua"
 */
const KEY = 'accademia-dati-weeks-v1';
const TOTAL = 12;
const base = () => document.documentElement.dataset.base ?? '';
const slug = (n: number) => `${base()}/fase-1/settimana-${String(n).padStart(2, '0')}/`;

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
function nextOf(done: Set<number>) {
  for (let i = 1; i <= TOTAL; i++) if (!done.has(i)) return i;
  return 0;
}
function titles(): Record<string, string> {
  try { return JSON.parse(document.documentElement.dataset.weekTitles ?? '{}'); } catch { return {}; }
}

function render() {
  const done = read();
  const count = done.size;
  const next = nextOf(done);
  const t = titles();

  document.querySelectorAll<HTMLElement>('[data-week-state]').forEach((el) => {
    const n = Number(el.dataset.weekState);
    el.classList.toggle('is-done', done.has(n));
    el.classList.toggle('is-next', n === next);
  });
  document.querySelectorAll<HTMLButtonElement>('[data-week-toggle]').forEach((btn) => {
    const isDone = done.has(Number(btn.dataset.weekToggle));
    btn.setAttribute('aria-pressed', String(isDone));
    const label = btn.querySelector('[data-label]');
    if (label) label.textContent = isDone ? (btn.dataset.labelDone ?? 'Fatta') : (btn.dataset.labelTodo ?? 'Segna come fatta');
  });
  document.querySelectorAll<HTMLElement>('[data-progress-count]').forEach((el) => { el.textContent = `${count} / ${TOTAL}`; });
  document.querySelectorAll<HTMLElement>('[data-progress-pct]').forEach((el) => { el.textContent = `${Math.round((count / TOTAL) * 100)}%`; });
  document.querySelectorAll<HTMLElement>('[data-progress-bar]').forEach((el) => { el.style.setProperty('--p', String(count / TOTAL)); });
  document.querySelectorAll<HTMLElement>('[data-progress-meter]').forEach((el) => el.setAttribute('aria-valuenow', String(count)));

  document.querySelectorAll<HTMLAnchorElement>('[data-next-week]').forEach((a) => {
    const text = a.querySelector('[data-label]') ?? a;
    if (next) { a.href = slug(next); text.textContent = `Settimana ${next} · ${t[next] ?? ''}`; }
    else { a.href = `${base()}/percorso/#fase-2`; text.textContent = 'Fase 1 completata: passa alla Fase 2'; }
  });
  document.querySelectorAll<HTMLAnchorElement>('[data-cta-start]').forEach((a) => {
    const text = a.querySelector('[data-label]') ?? a;
    if (count === 0) { a.href = slug(1); text.textContent = 'Inizia dalla settimana 1'; }
    else if (next) { a.href = slug(next); text.textContent = `Continua: settimana ${next}`; }
    else { a.href = `${base()}/percorso/#fase-2`; text.textContent = 'Vai alla Fase 2'; }
  });
  document.documentElement.dataset.phase1Done = String(count === TOTAL);
  document.documentElement.dataset.started = String(count > 0);
}

function toast(msg: string, link?: { href: string; text: string }) {
  const host = document.querySelector<HTMLElement>('[data-toast]');
  if (!host) return;
  host.querySelector('[data-toast-msg]')!.textContent = msg;
  const a = host.querySelector<HTMLAnchorElement>('[data-toast-link]')!;
  a.hidden = !link;
  if (link) { a.href = link.href; a.textContent = link.text; }
  host.hidden = false;
  host.classList.remove('is-in'); void host.offsetWidth; host.classList.add('is-in');
  clearTimeout(Number(host.dataset.timer));
  host.dataset.timer = String(setTimeout(() => { host.classList.remove('is-in'); setTimeout(() => (host.hidden = true), 300); }, 5000));
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const btn = target.closest<HTMLButtonElement>('[data-week-toggle]');
  if (btn) {
    const n = Number(btn.dataset.weekToggle);
    const done = read();
    const adding = !done.has(n);
    adding ? done.add(n) : done.delete(n);
    write(done);
    render();
    if (adding) {
      const nx = nextOf(done);
      toast(`Settimana ${n} completata. ${done.size} su ${TOTAL}.`,
        nx ? { href: slug(nx), text: `Vai alla settimana ${nx}` } : { href: `${base()}/percorso/#fase-2`, text: 'Passa alla Fase 2' });
    }
    return;
  }
  if (target.closest('[data-toast-close]')) {
    const host = document.querySelector<HTMLElement>('[data-toast]');
    if (host) { host.classList.remove('is-in'); host.hidden = true; }
    return;
  }
  const reset = target.closest<HTMLButtonElement>('[data-progress-reset]');
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

document.addEventListener('astro:page-load', render);
