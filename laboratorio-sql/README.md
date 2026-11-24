# Laboratorio SQL

Un corso pratico di SQL in **un solo file HTML**: lo apri con un doppio clic e funziona nel browser, anche senza internet. Dentro c'è un vero database **SQLite** con i dati di **Chinook**, un negozio di musica online (artisti, album, brani, clienti, fatture, dipendenti).

**File da aprire:** [`Laboratorio-SQL.html`](Laboratorio-SQL.html). Su GitHub: apri il file, poi "Download raw file". Online: https://fedecopp.github.io/accademia-dati/laboratorio-sql.html

## Cosa contiene

13 moduli in ordine, dalle basi alle analisi: SELECT, WHERE, ORDER BY e DISTINCT, funzioni e CASE, aggregazioni, GROUP BY e HAVING, JOIN, subquery, CTE, window function, modifica dei dati e sfide finali. In tutto **34 esempi eseguibili** e **72 esercizi con correzione automatica**.

- **Esegui** mostra il risultato, **Verifica** dice se è corretto e, se no, che cosa non torna.
- Suggerimenti uno alla volta; la soluzione compare dopo due tentativi.
- **Schema**: tabelle, colonne e collegamenti di Chinook; un clic inserisce il nome nell'editor.
- **Area libera**: un editor senza esercizi, con il pulsante per riportare il database allo stato iniziale.
- I progressi restano salvati nel browser.

## Per chi modifica il laboratorio

| Cosa | Dove |
| --- | --- |
| Spiegazioni, esempi, esercizi | `src/lezioni.js` |
| Interfaccia | `src/app.js`, `src/styles.css`, `src/index.html` |
| Esecuzione e correzione | `src/engine.js`, `src/grade.js` |
| Database | `data/chinook.sqlite` (versione con chiavi auto-incrementali) |

```bash
npm run lab:build              # crea Laboratorio-SQL.html e la copia in public/
npm run lab:verifica           # ogni soluzione passa, ogni codice iniziale no, ogni esempio gira
npm run lab:verifica:browser   # prova il file in Chromium da file://, con la rete bloccata
```

Esercizi di tipo `query`: il risultato si confronta con quello della soluzione. Esercizi di tipo `modifica`: si esegue il codice su una copia nuova del database, poi la query `controllo`, e si confronta con lo stesso controllo dopo la soluzione. `ordinato: true` solo quando la consegna chiede un ordine preciso, con un criterio per i pari merito.

## Licenze

- Database Chinook: MIT, © 2008-2024 Luis Rocha (`data/LICENSE-Chinook.md`, versione in `data/CHINOOK-VERSION.txt`).
- sql.js 1.15.2: MIT, con SQLite (pubblico dominio).
- CodeMirror 6: MIT.
