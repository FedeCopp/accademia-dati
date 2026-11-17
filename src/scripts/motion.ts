/**
 * Animazioni leggere, solo JS nativo.
 * - [data-reveal]: compare allo scroll (fade + salita). [data-reveal-group] assegna lo stagger ai figli.
 * - [data-intro]: ingresso in sequenza al caricamento (solo CSS, attivato da .js-motion).
 * - [data-reading-bar]: barra di lettura della pagina.
 * - [data-toc] + sezioni [data-step]: indice che evidenzia la sezione in lettura.
 * Con prefers-reduced-motion non si nasconde nulla.
 */
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let observer: IntersectionObserver | undefined;
let cleanups: Array<() => void> = [];

function setupReveal() {
  observer?.disconnect();
  if (reduce.matches || !('IntersectionObserver' in window)) {
    document.documentElement.classList.remove('js-motion');
    return;
  }
  document.documentElement.classList.add('js-motion');
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((g) => {
    [...g.children].forEach((c, i) => {
      const el = c as HTMLElement;
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      el.style.setProperty('--i', String(Math.min(i, 8)));
    });
  });
  observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); observer?.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
    // Ciò che è già nel viewport compare subito: niente buchi nel primo frame.
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight * 0.92) el.classList.add('is-visible');
    else observer!.observe(el);
  });
}

function setupReadingBar() {
  const bar = document.querySelector<HTMLElement>('[data-reading-bar]');
  if (!bar) return;
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  cleanups.push(() => removeEventListener('scroll', onScroll));
}

function setupToc() {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc] a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      map.get(e.target.id)?.setAttribute('aria-current', 'step');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('[data-step]').forEach((s) => io.observe(s));
  cleanups.push(() => io.disconnect());
}

document.addEventListener('astro:page-load', () => {
  cleanups.forEach((f) => f()); cleanups = [];
  setupReveal();
  setupReadingBar();
  setupToc();
});
