# Accademia Dati

Sito statico Astro 7 + MDX con isole React 19, Tailwind CSS v4 e TypeScript, pubblicato su GitHub Pages con `base: '/accademia-dati'`. Lingua dei contenuti: italiano.

## Comandi
- `npm run dev` · `npm run build` (Astro + Pagefind) · `npm run check` (astro check, deve restare a 0 errori)
- `npm run verifica:esercizi` (dopo `npm run build`): prova ogni esercizio nel browser con Playwright; la soluzione deve passare e il codice iniziale fallire. In Astro 7 `astro preview` resta attivo in background: si ferma con `npx astro preview stop`.

## Convenzioni
- I link interni passano sempre da `url()` in `src/lib/url.ts` (gestisce il base path). Mai `href="/..."` diretto.
- I contenuti stanno nelle content collections (`src/content.config.ts`): fasi, settimane (MDX), glossario (JSON).
- Nelle MDX non usare `{` o `<` nel testo fuori dai blocchi di codice.
- Progressi: `src/scripts/progress.ts`, chiave localStorage `accademia-dati-weeks-v1`, attributi `data-week-toggle`, `data-week-state`, `data-progress-*`, `data-next-week`.
- Icone: solo `src/components/Icon.astro` (SVG stile Lucide), mai emoji.

## React, Tailwind e shadcn
- Struttura shadcn: `components.json`, alias `@/*` → `src/*`, componenti React in `src/components/ui/` (es. `npx shadcn@latest add <componente>`), `cn()` in `src/lib/utils.ts`.
- I componenti React si usano nelle pagine `.astro` come isole: `client:load` (sopra la piega) o `client:visible`.
- Tailwind v4 (`src/styles/tailwind.css`) è caricato SENZA preflight: il reset e lo stile di base restano in `global.css`, che non è in un layer e quindi vince sulle utility in caso di conflitto. Attenzione ai nomi di classe che coincidono con utility Tailwind (es. `ring`, `container`, `border`).
- `DecryptText` (`src/components/ui/decrypt-text.tsx`, Motiq, MIT): i token `--motiq-*` sono collegati alla palette in `global.css`.
- Animazioni: libreria `motion` (`motion` per gli script vanilla in `src/scripts/motion.ts`, `motion/react` nelle isole, es. `progress-ring.tsx`). Sempre rispettare `prefers-reduced-motion`.

## Esercizi nel browser
- Campo `esercizi` nel frontmatter delle settimane (schema in `src/content.config.ts`): `id`, `titolo`, `consegna` (supporta `codice` e **grassetto**), `linguaggio` (sql|python), `dataset`, `iniziale`, `soluzione`, `ordinato`, `test`, `suggerimenti`.
- Componente `src/components/ui/code-exercise.tsx` (CodeMirror 6), usato come isola `client:visible` nel passo "Esercitati qui" di `src/pages/fase-1/[slug].astro`.
- SQL: DuckDB-WASM (`src/lib/runners/sql.ts`, file .wasm serviti dal sito), corretto confrontando il risultato con quello della soluzione (`src/lib/runners/grade.ts`).
- Python: Pyodide 314.0.7 da jsDelivr in un Web Worker (`src/lib/runners/python.worker.ts`), tempo massimo 10 s; i `test` sono `assert` eseguiti dopo il codice dello studente.
- Dati di esempio in `public/data/*.csv` (fittizi, a scopo didattico). Se cambi un CSV, rilancia `npm run verifica:esercizi`.
- Stato nel browser: `accademia-dati-exercises-v1` (superati) e `accademia-dati-draft-<id>` (bozze), helper in `src/lib/exercises.ts`.
- Niente link a video: le spiegazioni sono scritte nelle lezioni.

## Laboratorio SQL (cartella `laboratorio-sql/`)
- App separata dal sito: un solo file HTML offline (`Laboratorio-SQL.html`) con sql.js 1.15.2 + database Chinook + CodeMirror, tutto in base64. Font di sistema, niente risorse esterne.
- Contenuti in `laboratorio-sql/src/lezioni.js`; correzione in `src/engine.js` e `src/grade.js` (stessa logica di `src/lib/runners/grade.ts`).
- Dopo ogni modifica: `npm run lab:build`, `npm run lab:verifica`, `npm run lab:verifica:browser`. Il build copia il file in `public/laboratorio-sql.html`: committa entrambi.
- `new SQL.Database(bytes)` scrive nel buffer che riceve: passa sempre una copia (`new Uint8Array(bytes)`).
- Motore principale WebAssembly (`sql-wasm-browser`), riserva asm.js (`sql-asm.js`) se WebAssembly è bloccato. L'avviso `.boot-help` compare via CSS dopo 6 s se JavaScript non parte (anteprime delle app).

## Design
- Per qualsiasi lavoro sull'interfaccia usa la skill `ui-ux-pro-max` (`.claude/skills/ui-ux-pro-max/`).
- Leggi prima `design-system/accademia-dati/DECISIONS.md` e poi `MASTER.md`; DECISIONS ha la precedenza.
- Colori solo tramite i token in `src/styles/global.css`, definiti per tema chiaro e scuro.
- Prima di consegnare: controllo con Playwright a 1280px e 390px, chiaro e scuro, nessuno scroll orizzontale.
