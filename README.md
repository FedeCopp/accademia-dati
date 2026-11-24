# Accademia Dati

Un percorso di data intelligence da zero: circa 14 mesi, 5–8 ore a settimana, un progetto reale per ogni fase.

**Sito:** https://fedecopp.github.io/accademia-dati/

## Cosa contiene

- **Percorso** in 5 fasi: fondamenta, trasformare i dati, capire e comunicare, intelligence e scala, specializzazione.
- **Fase 1** in 12 lezioni settimanali, ognuna con obiettivo, teoria in breve, esercizio e risorse gratuite.
- **Esercizi nel browser** con editor, esecuzione e correzione automatica: SQL con DuckDB-WASM, Python con Pyodide (pandas e matplotlib inclusi). Tutto gira nel browser, senza server.
- **Laboratorio SQL** (`laboratorio-sql/`): un corso SQL in un solo file HTML offline, con SQLite e il database Chinook, 72 esercizi corretti in automatico.
- Progressi da spuntare, salvati nel browser.
- Pagine dedicate ai progetti, al ponte verso la cybersecurity e al glossario, più una ricerca su tutto il sito.

## Lanciarlo in locale

Serve Node.js 22 o più recente.

```bash
npm install
npm run dev        # http://localhost:4321/accademia-dati/
npm run build      # build + indice di ricerca in dist/
npm run preview    # anteprima della build (qui funziona anche la ricerca)
npm run verifica:esercizi   # dopo la build: prova tutti gli esercizi nel browser
```

## Aggiungere o modificare contenuti

| Cosa | Dove |
| --- | --- |
| Lezioni della Fase 1 | `src/content/settimane/settimana-NN.mdx` |
| Fasi del percorso | `src/content/fasi/fase-N.md` |
| Glossario | `src/content/glossario.json` |
| Esercizi | campo `esercizi` nel frontmatter della settimana |
| Dati degli esercizi | `public/data/*.csv` |

I campi obbligatori di ogni file sono definiti in `src/content.config.ts`: se ne manca uno, la build si ferma e indica quale.
Ogni push su `main` ripubblica il sito in automatico con GitHub Actions.

## Tecnologie

Astro 7 con MDX, isole React 19, Tailwind CSS v4, TypeScript, [motion](https://motion.dev) per le animazioni e Pagefind per la ricerca. Il progetto segue la struttura di shadcn/ui: i componenti React stanno in `src/components/ui/` e se ne aggiungono altri con:

```bash
npx shadcn@latest add <nome-componente>
```

Il titolo e il terminale della home usano [Decrypt Text](https://motiq.dev/components/decrypt-text) di Motiq (licenza MIT).

## Design

I token di design sono in `src/styles/global.css` e vengono da `design-system/accademia-dati/`, generato con la skill [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (licenza MIT), installata in `.claude/skills/ui-ux-pro-max/`. Le scelte che si discostano dal file generato sono in `design-system/accademia-dati/DECISIONS.md`.
