# Accademia Dati

Un percorso di data intelligence da zero: circa 14 mesi, 5–8 ore a settimana, un progetto reale per ogni fase.

**Sito:** https://fedecopp.github.io/accademia-dati/

## Cosa contiene

- **Percorso** in 5 fasi: fondamenta, trasformare i dati, capire e comunicare, intelligence e scala, specializzazione.
- **Fase 1** in 12 lezioni settimanali, ognuna con obiettivo, teoria in breve, esercizio e risorse gratuite.
- Progressi da spuntare, salvati nel browser.
- Pagine dedicate ai progetti, al ponte verso la cybersecurity e al glossario, più una ricerca su tutto il sito.

## Lanciarlo in locale

Serve Node.js 22 o più recente.

```bash
npm install
npm run dev        # http://localhost:4321/accademia-dati/
npm run build      # build + indice di ricerca in dist/
npm run preview    # anteprima della build (qui funziona anche la ricerca)
```

## Aggiungere o modificare contenuti

| Cosa | Dove |
| --- | --- |
| Lezioni della Fase 1 | `src/content/settimane/settimana-NN.mdx` |
| Fasi del percorso | `src/content/fasi/fase-N.md` |
| Glossario | `src/content/glossario.json` |

I campi obbligatori di ogni file sono definiti in `src/content.config.ts`: se ne manca uno, la build si ferma e indica quale.
Ogni push su `main` ripubblica il sito in automatico con GitHub Actions.

## Design

I token di design sono in `src/styles/global.css` e vengono da `design-system/accademia-dati/`, generato con la skill [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) (licenza MIT), installata in `.claude/skills/ui-ux-pro-max/`. Le scelte che si discostano dal file generato sono in `design-system/accademia-dati/DECISIONS.md`.
