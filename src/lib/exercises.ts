/** Stato degli esercizi nel browser: superati e bozze. Chiavi stabili, letture protette. */
export const EX_KEY = 'accademia-dati-exercises-v1';
export const EX_EVENT = 'exercise:change';
const DRAFT = (id: string) => `accademia-dati-draft-${id}`;

export function passedSet(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(EX_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function markPassed(id: string) {
  const s = passedSet();
  if (s.has(id)) return;
  s.add(id);
  try { localStorage.setItem(EX_KEY, JSON.stringify([...s])); } catch { /* storage bloccato */ }
  window.dispatchEvent(new CustomEvent(EX_EVENT, { detail: { id } }));
}

export function readDraft(id: string): string | null {
  try { return localStorage.getItem(DRAFT(id)); } catch { return null; }
}
export function writeDraft(id: string, code: string | null) {
  try {
    if (code === null) localStorage.removeItem(DRAFT(id));
    else localStorage.setItem(DRAFT(id), code);
  } catch { /* storage bloccato */ }
}
