/**
 * Animazioni del sito con la libreria `motion` (API vanilla).
 * - [data-reveal]: compare quando entra nel viewport (molla leggera).
 * - [data-reveal-group]: i figli compaiono in sequenza con stagger.
 * - [data-intro]: ingresso della testata al caricamento (CSS, attivato da .js-motion).
 * - [data-reading-bar]: barra di lettura legata allo scorrimento.
 * - [data-toc] + sezioni [data-step]: indice che evidenzia la sezione in lettura.
 * Lo stato nascosto esiste solo con .js-motion (aggiunta in Base.astro); con reduced-motion
 * o senza JS tutto resta visibile.
 */
import { animate, inView, scroll, stagger } from 'motion';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const spring = { type: 'spring', bounce: 0, duration: 0.7 } as const;
const MARGIN = '0px 0px -8% 0px';
let cleanups: VoidFunction[] = [];

function show(els: Element[], withStagger: boolean) {
  els.forEach((el) => el.classList.add('is-visible'));
  animate(els, { opacity: [0, 1], y: [14, 0] }, { ...spring, delay: withStagger ? stagger(0.07) : 0 });
}

function setupReveal() {
  const root = document.documentElement;
  if (reduce.matches || !('IntersectionObserver' in window)) {
    root.classList.remove('js-motion');
    return;
  }
  root.classList.add('js-motion');

  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const items = [...group.children].filter((c) => !c.classList.contains('is-visible'));
    items.forEach((c) => c.setAttribute('data-reveal', ''));
    cleanups.push(inView(group, () => show(items, true), { margin: MARGIN, amount: 0.05 }));
  });
  document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-visible)').forEach((el) => {
    if (el.parentElement?.hasAttribute('data-reveal-group')) return;
    cleanups.push(inView(el, () => show([el], false), { margin: MARGIN, amount: 0.1 }));
  });
}

function setupReadingBar() {
  const bar = document.querySelector<HTMLElement>('[data-reading-bar]');
  if (!bar) return;
  cleanups.push(scroll((progress: number) => { bar.style.transform = `scaleX(${progress})`; }));
}

function setupToc() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a')];
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.hash.slice(1), a]));
  document.querySelectorAll<HTMLElement>('[data-step]').forEach((section) => {
    cleanups.push(inView(section, () => {
      links.forEach((a) => a.removeAttribute('aria-current'));
      map.get(section.id)?.setAttribute('aria-current', 'step');
    }, { margin: '-30% 0px -60% 0px', amount: 0 }));
  });
}

document.addEventListener('astro:page-load', () => {
  cleanups.forEach((f) => f());
  cleanups = [];
  setupReveal();
  setupReadingBar();
  setupToc();
});
