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

## Componenti e librerie (v3)

- **DecryptText** (Motiq) sul titolo della home, sul terminale della home e sulla pagina 404. Il titolo si decifra una volta all'apertura e di nuovo al passaggio del mouse; il terminale ripete l'animazione ogni 6,5 s solo quando è visibile. Con reduced-motion o senza JS mostra subito il testo.
- I token `--motiq-*` puntano ai nostri (`--color-primary`, `--color-foreground`…); nel terminale sono ridefiniti sui colori del codice, che restano scuri in entrambi i temi.
- **motion** sostituisce le animazioni fatte a mano: comparsa allo scroll con molla senza rimbalzo e stagger di 70 ms, barra di lettura con `scroll()`, anello dei progressi con `motion/react`.
- Costo: la home passa da circa 10 KB a circa 140 KB di JavaScript compresso, per via di React e motion. Le altre pagine caricano React solo se contengono un'isola.

## Esercizi nel browser (v4)

- Ricerca della skill: nessuna skill o plugin del catalogo esegue codice nel browser; per l'interfaccia si usa ui-ux-pro-max (stati di caricamento visibili, code splitting, controlli con stato esplicito).
- Pannello unico: consegna, editor scuro in entrambi i temi (coerente con i blocchi di codice), azioni, esito, risultato. Esito con icona e testo ("Superato" / "Non ancora"), non solo colore, annunciato con `aria-live`.
- I motori si caricano al primo "Esegui", con un messaggio che dice quanto pesano. La soluzione si mostra dopo 2 tentativi, o con una conferma.
- Gli avvisi interni delle librerie Python sono nascosti: chi impara vede solo i propri errori, spiegati in italiano.
