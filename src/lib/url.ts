/** Prefissa un percorso interno con il base path del sito (GitHub Pages). */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export const pad = (n: number) => String(n).padStart(2, '0');
export const weekSlug = (n: number) => `settimana-${pad(n)}`;
