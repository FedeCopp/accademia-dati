# Accademia Dati

Sito statico Astro 7 + MDX, pubblicato su GitHub Pages con `base: '/accademia-dati'`. Lingua dei contenuti: italiano.

## Comandi
- `npm run dev` · `npm run build` (Astro + Pagefind) · `npm run check` (astro check, deve restare a 0 errori)

## Convenzioni
- I link interni passano sempre da `url()` in `src/lib/url.ts` (gestisce il base path). Mai `href="/..."` diretto.
- I contenuti stanno nelle content collections (`src/content.config.ts`): fasi, settimane (MDX), glossario (JSON).
- Nelle MDX non usare `{` o `<` nel testo fuori dai blocchi di codice.
- Progressi: `src/scripts/progress.ts`, chiave localStorage `accademia-dati-weeks-v1`, attributi `data-week-toggle`, `data-week-state`, `data-progress-*`, `data-next-week`.
- Icone: solo `src/components/Icon.astro` (SVG stile Lucide), mai emoji.

## Design
- Per qualsiasi lavoro sull'interfaccia usa la skill `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/`).
- Leggi prima `design-system/accademia-dati/DECISIONS.md` e poi `MASTER.md`; DECISIONS ha la precedenza.
- Colori solo tramite i token in `src/styles/global.css`, definiti per tema chiaro e scuro.
- Prima di consegnare: controllo con Playwright a 1280px e 390px, chiaro e scuro, nessuno scroll orizzontale.
