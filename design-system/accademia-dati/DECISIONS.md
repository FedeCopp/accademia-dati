# Scelte rispetto a MASTER.md

MASTER.md è generato dalla skill UI UX Pro Max con la query
`"technical online course data analytics adults" --design-system`.
Queste scelte lo correggono e hanno la precedenza.

| Voce | MASTER.md | Scelta | Motivo |
| --- | --- | --- | --- |
| Stile | Claymorphism | Swiss minimal (proposto dalla skill per contenuti tecnici) | La claymorphism è pensata per app per bambini; il pubblico è adulto e il contenuto è tecnico. |
| Tema scuro | sconsigliato | supportato | Chi studia codice la sera usa spesso il tema scuro; contrasti verificati su entrambi. |
| Primary | `#0D9488` con testo nero | `#0F766E` con testo bianco (chiaro), `#2DD4BF` con testo scuro (scuro) | Contrasto ≥ 4.5:1 sui bottoni e sui link. |
| Accent | `#EA580C` | `#C2410C` per il testo, `#EA580C` per i riempimenti | Il testo arancio su fondo chiaro deve superare 4.5:1. |
| Font | Fira Code titoli, Fira Sans testo | Fira Sans 700 per i titoli; Fira Code solo per etichette, numeri e codice | Il monospace a grandi dimensioni affatica e appariva poco professionale (v2, novembre 2026). |

Regole sempre valide (checklist pre-consegna della skill): niente emoji come icone,
target di tocco ≥ 44px, focus visibile, `prefers-reduced-motion`, nessuno scroll
orizzontale da 375px in su.

## Movimento (v2)

- Token condivisi in `global.css`: `--dur-fast` 160ms, `--dur-base` 240ms, `--dur-slow` 520ms, easing `--ease-out`.
- `data-intro` per l'ingresso della testata, `data-reveal` / `data-reveal-group` per la comparsa allo scroll (`src/scripts/motion.ts`).
- Al massimo uno o due elementi animati per vista. Lo stato nascosto esiste solo con la classe `.js-motion`, quindi senza JS o con reduced-motion tutto resta visibile.
- Transizioni tra pagine con il `ClientRouter` di Astro: gli script di pagina si agganciano a `astro:page-load`.
