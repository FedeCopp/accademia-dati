/**
 * Contenuti del Laboratorio SQL (database Chinook).
 * teoria: mini-markdown (paragrafi, "- " elenchi, ```sql blocchi, `codice`, **grassetto**, "### " titoli).
 * Esercizi:
 *   tipo "query"    → il risultato dello studente si confronta con quello della soluzione.
 *   tipo "modifica" → si esegue il codice su una copia nuova del database, poi `controllo`,
 *                     e si confronta con lo stesso controllo eseguito dopo la soluzione.
 *   ordinato: true  → conta anche l'ordine delle righe (solo quando la consegna lo chiede).
 */

const VUOTO = '-- Scrivi qui la tua query\n';

export const MODULI = [
  {
    id: 'm00',
    titolo: 'Benvenuto',
    sottotitolo: "Cos'è un database e com'è fatto Chinook",
    teoria: `
Un **database** è un insieme di **tabelle**. Ogni tabella è come un foglio Excel: le **colonne** dicono che tipo di informazione c'è (nome, prezzo, data), le **righe** sono i singoli elementi (un brano, un cliente, una fattura).

**SQL** è il linguaggio con cui fai domande al database. Non dici *come* trovare i dati: descrivi *cosa* vuoi, e il database si arrangia.

### Il negozio Chinook

In questo laboratorio lavori su **Chinook**, il database di un negozio di musica online. Contiene 11 tabelle collegate:

- **Artist**, **Album**, **Track**: artisti, i loro album e i brani di ogni album.
- **Genre**, **MediaType**: il genere musicale e il formato del file.
- **Playlist**, **PlaylistTrack**: le playlist e i brani che contengono.
- **Customer**, **Invoice**, **InvoiceLine**: clienti, fatture e righe di ogni fattura.
- **Employee**: i dipendenti, con il loro responsabile.

Ogni tabella ha una **chiave primaria**, cioè una colonna che identifica ogni riga in modo unico (per esempio \`ArtistId\`). Quando una tabella contiene l'id di un'altra, come \`Album.ArtistId\`, quella è una **chiave esterna**: è così che le tabelle si collegano.

Apri il pannello **Schema** in alto per vedere tutte le tabelle e le colonne.

### Come si usa il laboratorio

- Negli **esempi** premi **Prova** per eseguirli e vedere il risultato; con **Modifica** li apri nell'**Area libera** e puoi cambiarli.
- Negli **esercizi** scrivi la tua query, premi **Esegui** (o Ctrl+Invio) per vedere il risultato e **Verifica** per sapere se è giusta.
- Il database non si rompe: ogni verifica parte da una copia nuova.
`,
    esempi: [
      { titolo: 'I primi 5 artisti', sql: 'SELECT *\nFROM Artist\nLIMIT 5;', nota: '`*` vuol dire "tutte le colonne". `LIMIT 5` mostra solo le prime 5 righe.' },
      { titolo: 'Tutti i generi musicali', sql: 'SELECT *\nFROM Genre;', nota: 'Senza LIMIT vedi tutte le righe: i generi sono 25.' },
    ],
    esercizi: [
      { id: 'm00-e1', titolo: 'La tua prima query', consegna: 'Mostra tutte le colonne e tutte le righe della tabella `Genre`.', iniziale: VUOTO, soluzione: 'SELECT *\nFROM Genre;', suggerimenti: ['La struttura è `SELECT * FROM nome_tabella;`'] },
      { id: 'm00-e2', titolo: 'I formati dei file', consegna: 'Mostra tutto il contenuto della tabella `MediaType`, che elenca i formati in cui sono venduti i brani.', iniziale: VUOTO, soluzione: 'SELECT *\nFROM MediaType;', suggerimenti: ['Come prima, cambia solo il nome della tabella.'] },
      { id: 'm00-e3', titolo: 'Le prime 10 playlist', consegna: 'Mostra tutte le colonne delle prime 10 righe della tabella `Playlist`.', iniziale: 'SELECT *\nFROM Playlist;', soluzione: 'SELECT *\nFROM Playlist\nLIMIT 10;', suggerimenti: ['Aggiungi `LIMIT 10` alla fine.'] },
    ],
  },

  {
    id: 'm01',
    titolo: 'SELECT',
    sottotitolo: 'Scegliere le colonne, rinominarle, calcolare',
    teoria: `
\`SELECT\` dice **quali colonne** vuoi, \`FROM\` **da quale tabella**. Al posto di \`*\` puoi elencare solo le colonne che ti servono, separate da virgole:

\`\`\`sql
SELECT Name, Composer
FROM Track;
\`\`\`

### Rinominare con AS

Con \`AS\` dai un nome nuovo a una colonna nel risultato. È utile per avere intestazioni chiare, in italiano o senza spazi:

\`\`\`sql
SELECT Name AS brano
FROM Track;
\`\`\`

### Colonne calcolate

Nel SELECT puoi fare calcoli. \`Milliseconds / 1000\` trasforma la durata in secondi. Attenzione: in SQLite **un intero diviso un intero dà un intero** (\`7 / 2\` fa 3). Per avere i decimali scrivi uno dei due numeri con la virgola: \`7 / 2.0\` fa 3.5.

Per unire testi si usa \`||\`: \`FirstName || ' ' || LastName\` dà "Luís Gonçalves". \`ROUND(valore, 2)\` arrotonda a 2 decimali.

Le righe che iniziano con \`--\` sono **commenti**: il database le ignora.
`,
    esempi: [
      { titolo: 'Solo due colonne', sql: 'SELECT Name, Composer\nFROM Track\nLIMIT 5;' },
      { titolo: 'Rinominare e calcolare', sql: 'SELECT Name                 AS brano,\n       Milliseconds / 1000  AS secondi\nFROM Track\nLIMIT 5;' },
      { titolo: 'Unire testi', sql: "SELECT FirstName || ' ' || LastName AS nome_completo,\n       Country\nFROM Customer\nLIMIT 5;" },
    ],
    esercizi: [
      { id: 'm01-e1', titolo: 'Solo i nomi degli artisti', consegna: 'Mostra solo la colonna `Name` della tabella `Artist`.', iniziale: 'SELECT *\nFROM Artist;', soluzione: 'SELECT Name\nFROM Artist;', suggerimenti: ['Sostituisci `*` con il nome della colonna.'] },
      { id: 'm01-e2', titolo: 'Nome, cognome ed email', consegna: 'Dalla tabella `Customer` mostra `FirstName`, `LastName` ed `Email`.', iniziale: VUOTO, soluzione: 'SELECT FirstName, LastName, Email\nFROM Customer;', suggerimenti: ['Le colonne si separano con una virgola.'] },
      { id: 'm01-e3', titolo: 'Rinominare una colonna', consegna: 'Mostra i titoli degli album (`Title` della tabella `Album`) in una colonna chiamata `titolo`.', iniziale: 'SELECT Title\nFROM Album;', soluzione: 'SELECT Title AS titolo\nFROM Album;', suggerimenti: ['Dopo il nome della colonna scrivi `AS titolo`.'] },
      { id: 'm01-e4', titolo: 'Durata in minuti', consegna: 'Per ogni brano mostra `Name` e la durata in minuti arrotondata a 2 decimali, in una colonna chiamata `minuti`. La durata è in `Milliseconds`.', iniziale: 'SELECT Name, Milliseconds\nFROM Track;', soluzione: 'SELECT Name,\n       ROUND(Milliseconds / 60000.0, 2) AS minuti\nFROM Track;', suggerimenti: ['Un minuto sono 60.000 millisecondi.', 'Scrivi `60000.0` e non `60000`, altrimenti la divisione toglie i decimali. Poi `ROUND(..., 2)`.'] },
      { id: 'm01-e5', titolo: 'Nome completo', consegna: 'Mostra `nome_completo` (nome, uno spazio, cognome) e `Country` di ogni cliente.', iniziale: 'SELECT FirstName, LastName, Country\nFROM Customer;', soluzione: "SELECT FirstName || ' ' || LastName AS nome_completo,\n       Country\nFROM Customer;", suggerimenti: ["I testi si uniscono con `||`. Lo spazio è un testo: `' '`."] },
      { id: 'm01-e6', titolo: "Prezzo con l'IVA", consegna: "Per i primi 10 brani della tabella mostra `Name`, `UnitPrice` e il prezzo con l'IVA al 22% arrotondato a 2 decimali, in una colonna `prezzo_ivato`.", iniziale: 'SELECT Name, UnitPrice\nFROM Track\nLIMIT 10;', soluzione: 'SELECT Name,\n       UnitPrice,\n       ROUND(UnitPrice * 1.22, 2) AS prezzo_ivato\nFROM Track\nLIMIT 10;', suggerimenti: ['Aggiungere il 22% vuol dire moltiplicare per 1.22.'] },
    ],
  },

  {
    id: 'm02',
    titolo: 'WHERE',
    sottotitolo: 'Filtrare le righe',
    teoria: `
\`WHERE\` tiene solo le righe che rispettano una condizione. Si scrive dopo \`FROM\`:

\`\`\`sql
SELECT FirstName, LastName
FROM Customer
WHERE Country = 'Italy';
\`\`\`

I testi vanno tra **apici singoli**. Gli operatori di confronto sono \`=\`, \`<>\` (diverso), \`<\`, \`>\`, \`<=\`, \`>=\`.

### Più condizioni

- \`AND\`: devono essere vere tutte e due.
- \`OR\`: basta che ne sia vera una.
- \`NOT\`: inverte la condizione.

\`AND\` viene valutato **prima** di \`OR\`, come la moltiplicazione prima della somma. Quando li mescoli, usa sempre le parentesi.

### Scorciatoie utili

- \`Country IN ('Italy', 'France')\` equivale a \`Country = 'Italy' OR Country = 'France'\`.
- \`Total BETWEEN 10 AND 20\` include gli estremi 10 e 20.
- \`Name LIKE '%love%'\` cerca un testo: \`%\` vuol dire "qualsiasi cosa", \`_\` "un carattere qualsiasi". In SQLite \`LIKE\` non distingue maiuscole e minuscole.
- \`Company IS NULL\` trova i valori **mancanti**. Non si scrive \`= NULL\`: NULL non è uguale a niente, nemmeno a se stesso.
`,
    esempi: [
      { titolo: 'Clienti in Italia', sql: "SELECT FirstName, LastName, City\nFROM Customer\nWHERE Country = 'Italy';" },
      { titolo: 'Brani che costano più di 0,99', sql: 'SELECT Name, UnitPrice\nFROM Track\nWHERE UnitPrice > 0.99\nLIMIT 10;' },
      { titolo: 'Titoli che contengono "love"', sql: "SELECT Name\nFROM Track\nWHERE Name LIKE '%love%';" },
      { titolo: "Clienti che lavorano per un'azienda", sql: 'SELECT FirstName, LastName, Company\nFROM Customer\nWHERE Company IS NOT NULL;' },
    ],
    esercizi: [
      { id: 'm02-e1', titolo: 'I clienti italiani', consegna: 'Mostra `FirstName`, `LastName` e `City` dei clienti che vivono in Italia (`Country` vale `Italy`).', iniziale: 'SELECT FirstName, LastName, City\nFROM Customer;', soluzione: "SELECT FirstName, LastName, City\nFROM Customer\nWHERE Country = 'Italy';", suggerimenti: ["Aggiungi `WHERE Country = 'Italy'`. Il testo va tra apici singoli."] },
      { id: 'm02-e2', titolo: 'Brani di oltre 10 minuti', consegna: 'Mostra `Name` e `Milliseconds` dei brani che durano più di 10 minuti.', iniziale: 'SELECT Name, Milliseconds\nFROM Track;', soluzione: 'SELECT Name, Milliseconds\nFROM Track\nWHERE Milliseconds > 600000;', suggerimenti: ['10 minuti = 10 × 60 × 1000 millisecondi.'] },
      { id: 'm02-e3', titolo: 'Brasile o Canada', consegna: 'Mostra `FirstName`, `LastName` e `Country` dei clienti di Brasile (`Brazil`) e Canada (`Canada`). Prova a usare `IN`.', iniziale: VUOTO, soluzione: "SELECT FirstName, LastName, Country\nFROM Customer\nWHERE Country IN ('Brazil', 'Canada');", suggerimenti: ["`WHERE Country IN ('Brazil', 'Canada')`"] },
      { id: 'm02-e4', titolo: 'Fatture tra 10 e 20', consegna: 'Mostra `InvoiceId` e `Total` delle fatture con un totale da 10 a 20, estremi compresi.', iniziale: VUOTO, soluzione: 'SELECT InvoiceId, Total\nFROM Invoice\nWHERE Total BETWEEN 10 AND 20;', suggerimenti: ['`BETWEEN 10 AND 20` include sia 10 sia 20.'] },
      { id: 'm02-e5', titolo: 'Canzoni d\'amore', consegna: 'Mostra il `Name` dei brani che contengono la parola "love" in qualsiasi punto del titolo.', iniziale: "SELECT Name\nFROM Track\nWHERE Name = 'love';", soluzione: "SELECT Name\nFROM Track\nWHERE Name LIKE '%love%';", suggerimenti: ['Con `=` cerchi un titolo identico. Ti serve `LIKE`.', '`%` prima e dopo la parola vuol dire "qualsiasi testo prima e dopo".'] },
      { id: 'm02-e6', titolo: 'Clienti privati', consegna: "Mostra `FirstName` e `LastName` dei clienti che **non** hanno un'azienda (`Company` è vuoto). La query di partenza non funziona: perché?", iniziale: 'SELECT FirstName, LastName\nFROM Customer\nWHERE Company = NULL;', soluzione: 'SELECT FirstName, LastName\nFROM Customer\nWHERE Company IS NULL;', suggerimenti: ['NULL non è un valore: è "nessun valore". Nessun confronto con `=` può essere vero.', 'Si scrive `IS NULL`.'] },
      { id: 'm02-e7', titolo: 'Le parentesi contano', consegna: 'Mostra `Name`, `GenreId` e `Milliseconds` dei brani **Rock** (`GenreId` 1) **o Metal** (`GenreId` 3) che durano più di 400.000 millisecondi. La query di partenza ha un errore di logica.', iniziale: 'SELECT Name, GenreId, Milliseconds\nFROM Track\nWHERE GenreId = 1 OR GenreId = 3 AND Milliseconds > 400000;', soluzione: 'SELECT Name, GenreId, Milliseconds\nFROM Track\nWHERE (GenreId = 1 OR GenreId = 3)\n  AND Milliseconds > 400000;', suggerimenti: ['`AND` viene prima di `OR`: la condizione sulla durata vale solo per il Metal.', 'Metti le due condizioni sul genere tra parentesi.'] },
      { id: 'm02-e8', titolo: 'Artisti che iniziano con "The"', consegna: 'Mostra il `Name` degli artisti il cui nome inizia con "The " (con lo spazio).', iniziale: VUOTO, soluzione: "SELECT Name\nFROM Artist\nWHERE Name LIKE 'The %';", suggerimenti: ["Il `%` va solo alla fine: `'The %'`."] },
    ],
  },

  {
    id: 'm03',
    titolo: 'ORDER BY e DISTINCT',
    sottotitolo: 'Ordinare e togliere i doppioni',
    teoria: `
Senza \`ORDER BY\` il database restituisce le righe in un ordine qualsiasi. Se l'ordine ti interessa, devi chiederlo:

\`\`\`sql
SELECT Name, Milliseconds
FROM Track
ORDER BY Milliseconds DESC;
\`\`\`

- \`ASC\` è crescente (il default), \`DESC\` decrescente.
- Puoi ordinare per più colonne: \`ORDER BY Country, LastName\` ordina per paese e, a parità di paese, per cognome.
- \`ORDER BY\` + \`LIMIT\` dà le classifiche: i 5 più lunghi, i 10 più cari.

### DISTINCT

\`SELECT DISTINCT Country FROM Customer\` mostra ogni paese **una volta sola**, anche se ci sono molti clienti dello stesso paese. Con più colonne, toglie le righe in cui *tutte* le colonne sono uguali.

L'ordine delle parole in una query è sempre questo: \`SELECT\` → \`FROM\` → \`WHERE\` → \`ORDER BY\` → \`LIMIT\`.
`,
    esempi: [
      { titolo: 'I 5 brani più lunghi', sql: 'SELECT Name, Milliseconds\nFROM Track\nORDER BY Milliseconds DESC\nLIMIT 5;' },
      { titolo: 'I paesi dei clienti, senza doppioni', sql: 'SELECT DISTINCT Country\nFROM Customer\nORDER BY Country;' },
    ],
    esercizi: [
      { id: 'm03-e1', titolo: 'I 5 brani più lunghi', consegna: 'Mostra `Name` e `Milliseconds` dei 5 brani più lunghi, dal più lungo.', ordinato: true, iniziale: 'SELECT Name, Milliseconds\nFROM Track\nLIMIT 5;', soluzione: 'SELECT Name, Milliseconds\nFROM Track\nORDER BY Milliseconds DESC\nLIMIT 5;', suggerimenti: ['`ORDER BY` va prima di `LIMIT`.', '`DESC` mette prima i valori più alti.'] },
      { id: 'm03-e2', titolo: 'I paesi in ordine alfabetico', consegna: 'Mostra i paesi (`Country`) dei clienti, ognuno una volta sola, in ordine alfabetico.', ordinato: true, iniziale: 'SELECT Country\nFROM Customer;', soluzione: 'SELECT DISTINCT Country\nFROM Customer\nORDER BY Country;', suggerimenti: ['`SELECT DISTINCT` toglie i doppioni.'] },
      { id: 'm03-e3', titolo: 'Ordinare per due colonne', consegna: 'Mostra `Country`, `LastName` e `FirstName` dei clienti, ordinati per paese e, a parità di paese, per cognome.', ordinato: true, iniziale: VUOTO, soluzione: 'SELECT Country, LastName, FirstName\nFROM Customer\nORDER BY Country, LastName;', suggerimenti: ['`ORDER BY Country, LastName`'] },
      { id: 'm03-e4', titolo: 'Le 10 fatture più alte', consegna: "Mostra `InvoiceId` e `Total` delle 10 fatture più alte, dalla più alta. A parità di totale, metti prima quella con l'`InvoiceId` più piccolo.", ordinato: true, iniziale: VUOTO, soluzione: 'SELECT InvoiceId, Total\nFROM Invoice\nORDER BY Total DESC, InvoiceId\nLIMIT 10;', suggerimenti: ['Due criteri: `ORDER BY Total DESC, InvoiceId`.'] },
      { id: 'm03-e5', titolo: 'Le città brasiliane', consegna: 'Mostra le città (`City`) in cui ci sono clienti brasiliani, ognuna una volta sola.', iniziale: "SELECT City\nFROM Customer\nWHERE Country = 'Brazil';", soluzione: "SELECT DISTINCT City\nFROM Customer\nWHERE Country = 'Brazil';", suggerimenti: ['Aggiungi `DISTINCT` dopo `SELECT`.'] },
    ],
  },

  {
    id: 'm04',
    titolo: 'Funzioni e CASE',
    sottotitolo: 'Testi, numeri, date e condizioni',
    teoria: `
Le **funzioni** trasformano i valori. Le più usate:

- Testi: \`UPPER(x)\`, \`LOWER(x)\`, \`LENGTH(x)\`, \`SUBSTR(x, inizio, lunghezza)\`, \`REPLACE(x, 'da', 'a')\`, \`TRIM(x)\`.
- Numeri: \`ROUND(x, decimali)\`, \`ABS(x)\`.
- Valori mancanti: \`COALESCE(x, 'alternativa')\` restituisce il primo valore che non è NULL.

### Le date in SQLite

SQLite salva le date come testo nel formato \`'2024-03-15 00:00:00'\`. Per estrarre una parte si usa \`strftime\`:

- \`strftime('%Y', InvoiceDate)\` → l'anno, per esempio \`'2024'\`.
- \`strftime('%m', InvoiceDate)\` → il mese, \`'03'\`.
- \`strftime('%Y-%m', InvoiceDate)\` → anno e mese, \`'2024-03'\`.

Il risultato è un **testo**: per confrontarlo scrivi \`strftime('%Y', InvoiceDate) = '2024'\`, con gli apici.

### CASE WHEN

\`CASE\` è l'"if" di SQL: crea un valore diverso a seconda delle condizioni, controllate nell'ordine.

\`\`\`sql
SELECT Name,
       CASE
         WHEN Milliseconds < 180000 THEN 'breve'
         WHEN Milliseconds < 360000 THEN 'media'
         ELSE 'lunga'
       END AS fascia
FROM Track;
\`\`\`
`,
    esempi: [
      { titolo: 'Funzioni sui testi', sql: 'SELECT Name,\n       UPPER(Name)  AS maiuscolo,\n       LENGTH(Name) AS lettere\nFROM Artist\nLIMIT 5;' },
      { titolo: 'Scomporre una data', sql: "SELECT InvoiceDate,\n       strftime('%Y', InvoiceDate) AS anno,\n       strftime('%m', InvoiceDate) AS mese\nFROM Invoice\nLIMIT 5;" },
      { titolo: 'CASE WHEN', sql: "SELECT Name,\n       CASE WHEN Milliseconds > 300000 THEN 'lungo' ELSE 'normale' END AS durata\nFROM Track\nLIMIT 10;" },
      { titolo: 'COALESCE per i valori mancanti', sql: "SELECT FirstName, LastName,\n       COALESCE(Company, 'nessuna') AS azienda\nFROM Customer\nLIMIT 10;" },
    ],
    esercizi: [
      { id: 'm04-e1', titolo: 'Generi in maiuscolo', consegna: 'Mostra il nome di ogni genere (`Genre`) tutto in maiuscolo, in una colonna `nome`.', iniziale: 'SELECT Name\nFROM Genre;', soluzione: 'SELECT UPPER(Name) AS nome\nFROM Genre;', suggerimenti: ['`UPPER(Name) AS nome`'] },
      { id: 'm04-e2', titolo: 'Titoli lunghi', consegna: 'Mostra `Title` e il numero di caratteri del titolo (`lettere`) degli album con un titolo di più di 50 caratteri.', iniziale: VUOTO, soluzione: 'SELECT Title,\n       LENGTH(Title) AS lettere\nFROM Album\nWHERE LENGTH(Title) > 50;', suggerimenti: ['Puoi usare una funzione anche nel WHERE.'] },
      { id: 'm04-e3', titolo: 'Le fatture del 2024', consegna: 'Mostra `InvoiceId`, `InvoiceDate` e `Total` delle fatture emesse nel 2024.', iniziale: VUOTO, soluzione: "SELECT InvoiceId, InvoiceDate, Total\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2024';", suggerimenti: ["`strftime('%Y', InvoiceDate)` restituisce l'anno come testo: confrontalo con `'2024'`."] },
      { id: 'm04-e4', titolo: 'Anno di assunzione', consegna: "Mostra `FirstName`, `LastName` e l'anno di assunzione (`anno`) di ogni dipendente. La data di assunzione è in `HireDate`.", iniziale: 'SELECT FirstName, LastName, HireDate\nFROM Employee;', soluzione: "SELECT FirstName, LastName,\n       strftime('%Y', HireDate) AS anno\nFROM Employee;", suggerimenti: ["`strftime('%Y', HireDate) AS anno`"] },
      { id: 'm04-e5', titolo: 'Fasce di durata', consegna: "Per i brani dell'album con `AlbumId` 1 mostra `Name` e `fascia`: 'breve' sotto i 3 minuti, 'media' sotto i 6 minuti, altrimenti 'lunga'.", iniziale: 'SELECT Name, Milliseconds\nFROM Track\nWHERE AlbumId = 1;', soluzione: "SELECT Name,\n       CASE\n         WHEN Milliseconds < 180000 THEN 'breve'\n         WHEN Milliseconds < 360000 THEN 'media'\n         ELSE 'lunga'\n       END AS fascia\nFROM Track\nWHERE AlbumId = 1;", suggerimenti: ['3 minuti = 180.000 ms, 6 minuti = 360.000 ms.', 'Le condizioni del CASE si controllano in ordine: la prima vera vince.'] },
      { id: 'm04-e6', titolo: 'Azienda o privato', consegna: "Mostra `FirstName`, `LastName` e `azienda`: il nome dell'azienda del cliente, oppure 'Privato' se non ce l'ha.", iniziale: 'SELECT FirstName, LastName, Company AS azienda\nFROM Customer;', soluzione: "SELECT FirstName, LastName,\n       COALESCE(Company, 'Privato') AS azienda\nFROM Customer;", suggerimenti: ["`COALESCE(Company, 'Privato')`"] },
    ],
  },

  {
    id: 'm05',
    titolo: 'Aggregazioni',
    sottotitolo: 'Contare, sommare, fare medie',
    teoria: `
Le **funzioni di aggregazione** riassumono molte righe in un solo valore:

- \`COUNT(*)\`: quante righe.
- \`COUNT(colonna)\`: quante righe hanno un valore in quella colonna (salta i NULL).
- \`SUM(colonna)\`, \`AVG(colonna)\`: somma e media.
- \`MIN(colonna)\`, \`MAX(colonna)\`: il più piccolo e il più grande. Funzionano anche con testi e date.

\`\`\`sql
SELECT COUNT(*)            AS fatture,
       ROUND(SUM(Total), 2) AS fatturato
FROM Invoice;
\`\`\`

Il risultato è **una riga sola**. Puoi combinarle con \`WHERE\`: prima si filtrano le righe, poi si calcola.
`,
    esempi: [
      { titolo: 'Quanti brani ci sono', sql: 'SELECT COUNT(*) AS brani\nFROM Track;' },
      { titolo: 'Minimo, massimo e media delle fatture', sql: 'SELECT MIN(Total)            AS minimo,\n       MAX(Total)            AS massimo,\n       ROUND(AVG(Total), 2)  AS media\nFROM Invoice;' },
    ],
    esercizi: [
      { id: 'm05-e1', titolo: 'Quanti clienti', consegna: 'Conta i clienti, in una colonna `clienti`.', iniziale: VUOTO, soluzione: 'SELECT COUNT(*) AS clienti\nFROM Customer;', suggerimenti: ['`COUNT(*) AS clienti`'] },
      { id: 'm05-e2', titolo: 'Il fatturato totale', consegna: 'Calcola la somma di tutti i `Total` delle fatture, arrotondata a 2 decimali, in una colonna `fatturato`.', iniziale: VUOTO, soluzione: 'SELECT ROUND(SUM(Total), 2) AS fatturato\nFROM Invoice;', suggerimenti: ['`ROUND(SUM(Total), 2)`'] },
      { id: 'm05-e3', titolo: 'Durata media', consegna: 'Calcola la durata media dei brani in minuti, arrotondata a 2 decimali, in una colonna `media_minuti`.', iniziale: VUOTO, soluzione: 'SELECT ROUND(AVG(Milliseconds) / 60000.0, 2) AS media_minuti\nFROM Track;', suggerimenti: ['Prima la media dei millisecondi, poi dividi per 60000.0.'] },
      { id: 'm05-e4', titolo: 'COUNT(*) o COUNT(colonna)?', consegna: "Conta quanti clienti hanno un'azienda (`Company` non vuoto), in una colonna `con_azienda`. Senza usare WHERE.", iniziale: 'SELECT COUNT(*) AS con_azienda\nFROM Customer;', soluzione: 'SELECT COUNT(Company) AS con_azienda\nFROM Customer;', suggerimenti: ['`COUNT(*)` conta tutte le righe; `COUNT(Company)` salta quelle in cui Company è NULL.'] },
      { id: 'm05-e5', titolo: 'Prima e ultima fattura', consegna: "Mostra la data della prima fattura (`prima`) e quella dell'ultima (`ultima`).", iniziale: VUOTO, soluzione: 'SELECT MIN(InvoiceDate) AS prima,\n       MAX(InvoiceDate) AS ultima\nFROM Invoice;', suggerimenti: ['`MIN` e `MAX` funzionano anche con le date.'] },
    ],
  },

  {
    id: 'm06',
    titolo: 'GROUP BY e HAVING',
    sottotitolo: 'Riassumere per gruppi',
    teoria: `
\`GROUP BY\` divide le righe in **gruppi** e calcola le aggregazioni per ognuno:

\`\`\`sql
SELECT Country, COUNT(*) AS clienti
FROM Customer
GROUP BY Country;
\`\`\`

La regola d'oro: ogni colonna del \`SELECT\` deve essere **nel GROUP BY** oppure **dentro una funzione di aggregazione**. Altrimenti il database non sa quale valore mostrare per il gruppo.

### WHERE o HAVING?

- \`WHERE\` filtra le **righe** prima di raggruppare.
- \`HAVING\` filtra i **gruppi** dopo il calcolo, quindi può usare \`COUNT\`, \`SUM\` e le altre.

L'ordine completo diventa: \`SELECT\` → \`FROM\` → \`WHERE\` → \`GROUP BY\` → \`HAVING\` → \`ORDER BY\` → \`LIMIT\`.
`,
    esempi: [
      { titolo: 'Clienti per paese', sql: 'SELECT Country, COUNT(*) AS clienti\nFROM Customer\nGROUP BY Country\nORDER BY clienti DESC;' },
      { titolo: 'Generi con più di 100 brani', sql: 'SELECT GenreId, COUNT(*) AS brani\nFROM Track\nGROUP BY GenreId\nHAVING COUNT(*) > 100;' },
      { titolo: 'WHERE e HAVING insieme', sql: "SELECT BillingCountry, COUNT(*) AS fatture\nFROM Invoice\nWHERE strftime('%Y', InvoiceDate) = '2025'\nGROUP BY BillingCountry\nHAVING COUNT(*) >= 5;" },
    ],
    esercizi: [
      { id: 'm06-e1', titolo: 'Clienti per paese', consegna: 'Per ogni paese (`Country`) mostra quanti clienti ci sono, in una colonna `clienti`.', iniziale: 'SELECT Country\nFROM Customer;', soluzione: 'SELECT Country, COUNT(*) AS clienti\nFROM Customer\nGROUP BY Country;', suggerimenti: ['`COUNT(*)` + `GROUP BY Country`.'] },
      { id: 'm06-e2', titolo: 'Fatturato per paese', consegna: 'Per ogni paese di fatturazione (`BillingCountry`) mostra il fatturato (`fatturato`, somma di `Total` arrotondata a 2 decimali). Ordina dal paese che fattura di più; a parità di fatturato, in ordine alfabetico.', ordinato: true, iniziale: VUOTO, soluzione: 'SELECT BillingCountry,\n       ROUND(SUM(Total), 2) AS fatturato\nFROM Invoice\nGROUP BY BillingCountry\nORDER BY fatturato DESC, BillingCountry;', suggerimenti: ['Puoi ordinare per l\'alias: `ORDER BY fatturato DESC, BillingCountry`.'] },
      { id: 'm06-e3', titolo: 'Album con molti brani', consegna: 'Mostra `AlbumId` e numero di brani (`brani`) degli album che hanno più di 20 brani.', iniziale: 'SELECT AlbumId, COUNT(*) AS brani\nFROM Track\nGROUP BY AlbumId;', soluzione: 'SELECT AlbumId, COUNT(*) AS brani\nFROM Track\nGROUP BY AlbumId\nHAVING COUNT(*) > 20;', suggerimenti: ['Il filtro è su un conteggio: serve `HAVING`, non `WHERE`.'] },
      { id: 'm06-e4', titolo: 'Fatturato anno per anno', consegna: "Mostra per ogni anno (`anno`) il fatturato (`fatturato`, arrotondato a 2 decimali), dall'anno più vecchio.", ordinato: true, iniziale: VUOTO, soluzione: "SELECT strftime('%Y', InvoiceDate) AS anno,\n       ROUND(SUM(Total), 2)        AS fatturato\nFROM Invoice\nGROUP BY anno\nORDER BY anno;", suggerimenti: ["Raggruppa per `strftime('%Y', InvoiceDate)`. In SQLite puoi usare l'alias nel GROUP BY."] },
      { id: 'm06-e5', titolo: 'Paesi con almeno 5 clienti', consegna: 'Mostra `Country` e `clienti` solo per i paesi con almeno 5 clienti.', iniziale: VUOTO, soluzione: 'SELECT Country, COUNT(*) AS clienti\nFROM Customer\nGROUP BY Country\nHAVING COUNT(*) >= 5;', suggerimenti: ['"Almeno 5" vuol dire `>= 5`.'] },
      { id: 'm06-e6', titolo: 'Prezzo medio per formato', consegna: 'Per ogni formato (`MediaTypeId`) mostra il prezzo medio dei brani (`prezzo_medio`, arrotondato a 2 decimali).', iniziale: VUOTO, soluzione: 'SELECT MediaTypeId,\n       ROUND(AVG(UnitPrice), 2) AS prezzo_medio\nFROM Track\nGROUP BY MediaTypeId;', suggerimenti: ['`AVG(UnitPrice)` raggruppato per `MediaTypeId`.'] },
    ],
  },

  {
    id: 'm07',
    titolo: 'JOIN',
    sottotitolo: 'Collegare le tabelle',
    teoria: `
La tabella \`Album\` contiene \`ArtistId\`, non il nome dell'artista. Per avere titolo e nome insieme devi **unire** due tabelle con \`JOIN\`, dicendo su quale colonna si collegano con \`ON\`:

\`\`\`sql
SELECT al.Title AS album,
       ar.Name  AS artista
FROM Album AS al
JOIN Artist AS ar ON ar.ArtistId = al.ArtistId;
\`\`\`

\`al\` e \`ar\` sono **alias**: nomi brevi per le tabelle. Quando due tabelle hanno una colonna con lo stesso nome (qui \`Name\` esiste sia in Artist sia in Track), l'alias dice di quale si parla.

### JOIN o LEFT JOIN?

- \`JOIN\` (interna) tiene solo le righe che trovano corrispondenza in **entrambe** le tabelle.
- \`LEFT JOIN\` tiene **tutte** le righe della tabella di sinistra. Dove a destra non c'è corrispondenza, mette NULL. È il modo per trovare ciò che **manca**: artisti senza album, brani mai venduti.

### Più tabelle e self-join

Puoi concatenare più JOIN: \`Track\` → \`Album\` → \`Artist\`. Puoi anche unire una tabella **con se stessa**: in \`Employee\`, \`ReportsTo\` contiene l'id del responsabile, che è a sua volta un dipendente.
`,
    esempi: [
      { titolo: 'Album con il nome dell\'artista', sql: 'SELECT al.Title AS album, ar.Name AS artista\nFROM Album AS al\nJOIN Artist AS ar ON ar.ArtistId = al.ArtistId\nLIMIT 10;' },
      { titolo: 'Brani con il genere', sql: 'SELECT t.Name AS brano, g.Name AS genere\nFROM Track AS t\nJOIN Genre AS g ON g.GenreId = t.GenreId\nLIMIT 10;' },
      { titolo: 'LEFT JOIN: artisti senza album', sql: 'SELECT ar.Name, al.AlbumId\nFROM Artist AS ar\nLEFT JOIN Album AS al ON al.ArtistId = ar.ArtistId\nWHERE al.AlbumId IS NULL\nLIMIT 10;' },
      { titolo: 'Self-join: chi risponde a chi', sql: "SELECT e.FirstName || ' ' || e.LastName AS dipendente,\n       m.FirstName || ' ' || m.LastName AS responsabile\nFROM Employee AS e\nLEFT JOIN Employee AS m ON m.EmployeeId = e.ReportsTo;" },
    ],
    esercizi: [
      { id: 'm07-e1', titolo: 'Album e artista', consegna: "Mostra il titolo di ogni album (`album`) e il nome del suo artista (`artista`).", iniziale: 'SELECT Title AS album, ArtistId\nFROM Album;', soluzione: 'SELECT al.Title AS album,\n       ar.Name  AS artista\nFROM Album AS al\nJOIN Artist AS ar ON ar.ArtistId = al.ArtistId;', suggerimenti: ['Le due tabelle si collegano con `ArtistId`.', '`JOIN Artist AS ar ON ar.ArtistId = al.ArtistId`'] },
      { id: 'm07-e2', titolo: 'I brani jazz', consegna: 'Mostra il nome (`brano`) dei brani del genere **Jazz**. Usa il nome del genere, non il suo id.', iniziale: VUOTO, soluzione: "SELECT t.Name AS brano\nFROM Track AS t\nJOIN Genre AS g ON g.GenreId = t.GenreId\nWHERE g.Name = 'Jazz';", suggerimenti: ['Unisci `Track` e `Genre` con `GenreId`, poi filtra su `g.Name`.'] },
      { id: 'm07-e3', titolo: 'Fatture e clienti', consegna: 'Mostra `InvoiceId`, `FirstName`, `LastName` e `Total` delle fatture con un totale maggiore di 15.', iniziale: VUOTO, soluzione: 'SELECT i.InvoiceId, c.FirstName, c.LastName, i.Total\nFROM Invoice AS i\nJOIN Customer AS c ON c.CustomerId = i.CustomerId\nWHERE i.Total > 15;', suggerimenti: ['`Invoice` e `Customer` si collegano con `CustomerId`.'] },
      { id: 'm07-e4', titolo: 'Artisti senza album', consegna: 'Mostra il `Name` degli artisti che non hanno nessun album nel database.', iniziale: 'SELECT ar.Name\nFROM Artist AS ar\nJOIN Album AS al ON al.ArtistId = ar.ArtistId;', soluzione: 'SELECT ar.Name\nFROM Artist AS ar\nLEFT JOIN Album AS al ON al.ArtistId = ar.ArtistId\nWHERE al.AlbumId IS NULL;', suggerimenti: ['La JOIN interna scarta proprio gli artisti senza album. Ti serve `LEFT JOIN`.', 'Gli artisti senza album hanno `al.AlbumId` NULL: filtra con `IS NULL`.'] },
      { id: 'm07-e5', titolo: 'Tre tabelle: i brani dei Queen', consegna: "Mostra il nome dei brani (`brano`) e il titolo dell'album (`album`) dell'artista **Queen**.", iniziale: VUOTO, soluzione: "SELECT t.Name  AS brano,\n       al.Title AS album\nFROM Track AS t\nJOIN Album  AS al ON al.AlbumId = t.AlbumId\nJOIN Artist AS ar ON ar.ArtistId = al.ArtistId\nWHERE ar.Name = 'Queen';", suggerimenti: ['Il percorso è Track → Album → Artist: due JOIN.'] },
      { id: 'm07-e6', titolo: 'Incasso per genere', consegna: "Per ogni genere mostra il nome (`genere`) e l'incasso (`incasso`): la somma di prezzo × quantità delle righe di fattura (`InvoiceLine`), arrotondata a 2 decimali.", iniziale: VUOTO, soluzione: 'SELECT g.Name AS genere,\n       ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS incasso\nFROM InvoiceLine AS il\nJOIN Track AS t ON t.TrackId = il.TrackId\nJOIN Genre AS g ON g.GenreId = t.GenreId\nGROUP BY g.Name;', suggerimenti: ['Il percorso è InvoiceLine → Track → Genre.', 'Poi `GROUP BY g.Name` e `SUM(il.UnitPrice * il.Quantity)`.'] },
      { id: 'm07-e7', titolo: 'Dipendenti e responsabili', consegna: "Mostra per ogni dipendente `dipendente` (nome e cognome) e `responsabile` (nome e cognome di chi indica `ReportsTo`). Anche il direttore, che non ha un responsabile, deve comparire.", iniziale: "SELECT FirstName || ' ' || LastName AS dipendente, ReportsTo\nFROM Employee;", soluzione: "SELECT e.FirstName || ' ' || e.LastName AS dipendente,\n       m.FirstName || ' ' || m.LastName AS responsabile\nFROM Employee AS e\nLEFT JOIN Employee AS m ON m.EmployeeId = e.ReportsTo;", suggerimenti: ['Unisci `Employee` con se stessa usando due alias diversi, per esempio `e` e `m`.', 'Il direttore ha `ReportsTo` NULL: serve una `LEFT JOIN` per non perderlo.'] },
      { id: 'm07-e8', titolo: 'Il referente di ogni cliente', consegna: 'Mostra `FirstName` e `LastName` di ogni cliente e il cognome del dipendente che lo segue (`referente`). Il collegamento è `Customer.SupportRepId`.', iniziale: VUOTO, soluzione: 'SELECT c.FirstName, c.LastName,\n       e.LastName AS referente\nFROM Customer AS c\nJOIN Employee AS e ON e.EmployeeId = c.SupportRepId;', suggerimenti: ['`SupportRepId` contiene un `EmployeeId`.'] },
    ],
  },

  {
    id: 'm08',
    titolo: 'Subquery',
    sottotitolo: 'Una query dentro un\'altra',
    teoria: `
Una **subquery** è una query tra parentesi usata dentro un'altra. Tre usi tipici:

- **Un valore**: \`WHERE Milliseconds > (SELECT AVG(Milliseconds) FROM Track)\`. La subquery calcola la media, la query esterna la usa.
- **Una lista**: \`WHERE CustomerId IN (SELECT CustomerId FROM Invoice WHERE ...)\`.
- **Una tabella**: nel \`FROM\` puoi mettere una subquery e trattarla come una tabella (le serve un alias).

\`NOT IN\` trova ciò che **non** compare in una lista, per esempio i brani mai venduti. Attenzione: se la lista contiene un NULL, \`NOT IN\` non restituisce nulla.
`,
    esempi: [
      { titolo: 'Brani più lunghi della media', sql: 'SELECT Name, Milliseconds\nFROM Track\nWHERE Milliseconds > (SELECT AVG(Milliseconds) FROM Track)\nLIMIT 10;' },
      { titolo: 'Una subquery nel FROM', sql: 'SELECT ROUND(AVG(brani), 1) AS brani_medi_per_album\nFROM (\n  SELECT AlbumId, COUNT(*) AS brani\n  FROM Track\n  GROUP BY AlbumId\n) AS per_album;' },
    ],
    esercizi: [
      { id: 'm08-e1', titolo: 'Più lunghi della media', consegna: 'Mostra `Name` e `Milliseconds` dei brani più lunghi della durata media di tutti i brani.', iniziale: 'SELECT Name, Milliseconds\nFROM Track\nWHERE Milliseconds > 300000;', soluzione: 'SELECT Name, Milliseconds\nFROM Track\nWHERE Milliseconds > (SELECT AVG(Milliseconds) FROM Track);', suggerimenti: ['Al posto del numero fisso metti `(SELECT AVG(Milliseconds) FROM Track)`.'] },
      { id: 'm08-e2', titolo: 'Fatture sopra la media', consegna: 'Mostra `InvoiceId` e `Total` delle fatture con un totale superiore alla media.', iniziale: VUOTO, soluzione: 'SELECT InvoiceId, Total\nFROM Invoice\nWHERE Total > (SELECT AVG(Total) FROM Invoice);', suggerimenti: ["Stessa idea dell'esercizio precedente, sulla tabella Invoice."] },
      { id: 'm08-e3', titolo: 'Chi ha comprato nel 2025', consegna: 'Mostra `FirstName` e `LastName` dei clienti che hanno almeno una fattura nel 2025. Ogni cliente una volta sola: usa una subquery con `IN`.', iniziale: VUOTO, soluzione: "SELECT FirstName, LastName\nFROM Customer\nWHERE CustomerId IN (\n  SELECT CustomerId\n  FROM Invoice\n  WHERE strftime('%Y', InvoiceDate) = '2025'\n);", suggerimenti: ["La subquery restituisce i `CustomerId` delle fatture del 2025.", 'Con `IN` ogni cliente compare una volta sola, anche se ha più fatture.'] },
      { id: 'm08-e4', titolo: 'Brani mai venduti', consegna: 'Conta i brani che non compaiono in nessuna riga di fattura (`InvoiceLine`), in una colonna `mai_venduti`.', iniziale: VUOTO, soluzione: 'SELECT COUNT(*) AS mai_venduti\nFROM Track\nWHERE TrackId NOT IN (SELECT TrackId FROM InvoiceLine);', suggerimenti: ['`WHERE TrackId NOT IN (SELECT TrackId FROM InvoiceLine)`'] },
      { id: 'm08-e5', titolo: 'Il cliente migliore', consegna: 'Mostra `FirstName` e `LastName` del cliente che ha speso di più in totale.', iniziale: VUOTO, soluzione: 'SELECT FirstName, LastName\nFROM Customer\nWHERE CustomerId = (\n  SELECT CustomerId\n  FROM Invoice\n  GROUP BY CustomerId\n  ORDER BY SUM(Total) DESC\n  LIMIT 1\n);', suggerimenti: ['La subquery trova il `CustomerId` con la somma più alta: raggruppa, ordina per `SUM(Total) DESC`, `LIMIT 1`.'] },
    ],
  },

  {
    id: 'm09',
    titolo: 'CTE',
    sottotitolo: 'Query in passi con WITH',
    teoria: `
Una **CTE** (*Common Table Expression*) dà un nome a un risultato intermedio. Si scrive all'inizio con \`WITH\`, e poi si usa come una tabella:

\`\`\`sql
WITH spesa AS (
  SELECT CustomerId, SUM(Total) AS totale
  FROM Invoice
  GROUP BY CustomerId
)
SELECT c.FirstName, c.LastName, s.totale
FROM spesa AS s
JOIN Customer AS c ON c.CustomerId = s.CustomerId;
\`\`\`

Rispetto alle subquery, le CTE si leggono **dall'alto in basso**, come una ricetta. Puoi scriverne più di una separandole con una virgola: \`WITH a AS (...), b AS (...) SELECT ...\`. La seconda può usare la prima.

È il modo migliore per affrontare domande complicate: un passo per CTE, e controlli il risultato di ogni passo.
`,
    esempi: [
      { titolo: 'Spesa per cliente', sql: 'WITH spesa AS (\n  SELECT CustomerId, ROUND(SUM(Total), 2) AS totale\n  FROM Invoice\n  GROUP BY CustomerId\n)\nSELECT c.FirstName, c.LastName, s.totale\nFROM spesa AS s\nJOIN Customer AS c ON c.CustomerId = s.CustomerId\nORDER BY s.totale DESC\nLIMIT 5;' },
      { titolo: 'Due CTE in fila', sql: "WITH annuale AS (\n  SELECT strftime('%Y', InvoiceDate) AS anno, SUM(Total) AS fatturato\n  FROM Invoice\n  GROUP BY anno\n),\nmedia AS (\n  SELECT AVG(fatturato) AS valore FROM annuale\n)\nSELECT anno, ROUND(fatturato, 2) AS fatturato\nFROM annuale, media\nWHERE fatturato > media.valore;" },
    ],
    esercizi: [
      { id: 'm09-e1', titolo: 'Spesa con il nome', consegna: 'Usa una CTE `spesa` con il totale speso da ogni cliente, poi mostra `FirstName`, `LastName` e `totale` (arrotondato a 2 decimali).', iniziale: 'WITH spesa AS (\n  -- totale per CustomerId\n)\nSELECT *\nFROM spesa;', soluzione: 'WITH spesa AS (\n  SELECT CustomerId, SUM(Total) AS totale\n  FROM Invoice\n  GROUP BY CustomerId\n)\nSELECT c.FirstName, c.LastName, ROUND(s.totale, 2) AS totale\nFROM spesa AS s\nJOIN Customer AS c ON c.CustomerId = s.CustomerId;', suggerimenti: ['Dentro la CTE: `SELECT CustomerId, SUM(Total) AS totale FROM Invoice GROUP BY CustomerId`.', 'Fuori, unisci la CTE a `Customer`.'] },
      { id: 'm09-e2', titolo: 'Clienti sopra la media', consegna: 'Mostra `FirstName`, `LastName` e `totale` (arrotondato a 2 decimali) dei clienti che hanno speso più della media dei clienti.', iniziale: VUOTO, soluzione: 'WITH spesa AS (\n  SELECT CustomerId, SUM(Total) AS totale\n  FROM Invoice\n  GROUP BY CustomerId\n)\nSELECT c.FirstName, c.LastName, ROUND(s.totale, 2) AS totale\nFROM spesa AS s\nJOIN Customer AS c ON c.CustomerId = s.CustomerId\nWHERE s.totale > (SELECT AVG(totale) FROM spesa);', suggerimenti: ['La media va calcolata sulla spesa per cliente, non sulle singole fatture.', '`WHERE s.totale > (SELECT AVG(totale) FROM spesa)`'] },
      { id: 'm09-e3', titolo: 'I 5 artisti che vendono di più', consegna: "Mostra i 5 artisti con l'incasso più alto: `artista` e `incasso` (prezzo × quantità delle righe di fattura, arrotondato a 2 decimali), dal più alto.", ordinato: true, iniziale: VUOTO, soluzione: 'WITH vendite AS (\n  SELECT al.ArtistId, SUM(il.UnitPrice * il.Quantity) AS incasso\n  FROM InvoiceLine AS il\n  JOIN Track AS t  ON t.TrackId = il.TrackId\n  JOIN Album AS al ON al.AlbumId = t.AlbumId\n  GROUP BY al.ArtistId\n)\nSELECT ar.Name AS artista, ROUND(v.incasso, 2) AS incasso\nFROM vendite AS v\nJOIN Artist AS ar ON ar.ArtistId = v.ArtistId\nORDER BY v.incasso DESC\nLIMIT 5;', suggerimenti: ['Passo 1: incasso per `ArtistId` (InvoiceLine → Track → Album).', 'Passo 2: unisci ad `Artist` per il nome, ordina e limita a 5.'] },
      { id: 'm09-e4', titolo: 'I 3 mesi migliori', consegna: "Mostra i 3 mesi con l'incasso più alto: `mese` (nel formato `2024-03`) e `incasso` (somma di `Total`, arrotondata a 2 decimali), dal più alto. A parità di incasso, il mese più vecchio prima.", ordinato: true, iniziale: VUOTO, soluzione: "WITH mensile AS (\n  SELECT strftime('%Y-%m', InvoiceDate) AS mese,\n         ROUND(SUM(Total), 2)         AS incasso\n  FROM Invoice\n  GROUP BY mese\n)\nSELECT mese, incasso\nFROM mensile\nORDER BY incasso DESC, mese\nLIMIT 3;", suggerimenti: ["`strftime('%Y-%m', InvoiceDate)` dà anno e mese.", 'Ordina per `incasso DESC, mese`.'] },
    ],
  },

  {
    id: 'm10',
    titolo: 'Window function',
    sottotitolo: 'Classifiche, confronti e totali progressivi',
    teoria: `
Una **window function** calcola un valore guardando un gruppo di righe, ma **senza ridurle a una**, come farebbe GROUP BY. Si riconosce dalla parola \`OVER\`:

\`\`\`sql
SELECT CustomerId, InvoiceId, Total,
       SUM(Total) OVER (PARTITION BY CustomerId ORDER BY InvoiceDate) AS progressivo
FROM Invoice;
\`\`\`

Dentro \`OVER (...)\`:

- \`PARTITION BY\` divide le righe in gruppi (qui, un gruppo per cliente).
- \`ORDER BY\` ordina le righe dentro il gruppo.

Le più usate:

- \`ROW_NUMBER()\`: numera le righe 1, 2, 3…
- \`RANK()\`: classifica con i pari merito (1, 2, 2, 4…).
- \`LAG(colonna)\`: il valore della riga precedente, per i confronti "rispetto a prima".
- \`SUM(colonna) OVER (ORDER BY ...)\`: totale progressivo.

Una window function non si può filtrare nel \`WHERE\` della stessa query: si calcola in una CTE e si filtra fuori.
`,
    esempi: [
      { titolo: 'Classifica dei clienti per spesa', sql: 'WITH spesa AS (\n  SELECT CustomerId, ROUND(SUM(Total), 2) AS totale\n  FROM Invoice GROUP BY CustomerId\n)\nSELECT CustomerId, totale,\n       RANK() OVER (ORDER BY totale DESC) AS posizione\nFROM spesa\nLIMIT 10;' },
      { titolo: 'Confronto con l\'anno prima (LAG)', sql: "WITH annuale AS (\n  SELECT strftime('%Y', InvoiceDate) AS anno, ROUND(SUM(Total), 2) AS fatturato\n  FROM Invoice GROUP BY anno\n)\nSELECT anno, fatturato,\n       LAG(fatturato) OVER (ORDER BY anno) AS anno_prima\nFROM annuale;" },
      { titolo: 'Totale progressivo di un cliente', sql: 'SELECT InvoiceDate, Total,\n       ROUND(SUM(Total) OVER (ORDER BY InvoiceDate), 2) AS progressivo\nFROM Invoice\nWHERE CustomerId = 1;' },
    ],
    esercizi: [
      { id: 'm10-e1', titolo: 'Numerare le fatture', consegna: 'Per il cliente con `CustomerId` 1 mostra `InvoiceId`, `InvoiceDate` e `n`: il numero progressivo della fattura in ordine di data (1 la più vecchia).', iniziale: 'SELECT InvoiceId, InvoiceDate\nFROM Invoice\nWHERE CustomerId = 1;', soluzione: 'SELECT InvoiceId, InvoiceDate,\n       ROW_NUMBER() OVER (ORDER BY InvoiceDate) AS n\nFROM Invoice\nWHERE CustomerId = 1;', suggerimenti: ['`ROW_NUMBER() OVER (ORDER BY InvoiceDate) AS n`'] },
      { id: 'm10-e2', titolo: 'Classifica dei paesi', consegna: 'Mostra `BillingCountry`, `fatturato` (arrotondato a 2 decimali) e `posizione`: la classifica per fatturato, 1 al paese che fattura di più. A pari fatturato, stessa posizione.', iniziale: VUOTO, soluzione: 'WITH paesi AS (\n  SELECT BillingCountry, ROUND(SUM(Total), 2) AS fatturato\n  FROM Invoice\n  GROUP BY BillingCountry\n)\nSELECT BillingCountry, fatturato,\n       RANK() OVER (ORDER BY fatturato DESC) AS posizione\nFROM paesi;', suggerimenti: ['Prima il fatturato per paese (in una CTE), poi `RANK() OVER (ORDER BY fatturato DESC)`.'] },
      { id: 'm10-e3', titolo: 'Variazione anno su anno', consegna: "Mostra per ogni anno `anno`, `fatturato` e `variazione`: fatturato meno quello dell'anno prima, arrotondato a 2 decimali (NULL per il primo anno). In ordine di anno.", ordinato: true, iniziale: "WITH annuale AS (\n  SELECT strftime('%Y', InvoiceDate) AS anno, SUM(Total) AS fatturato\n  FROM Invoice\n  GROUP BY anno\n)\nSELECT anno, ROUND(fatturato, 2) AS fatturato\nFROM annuale\nORDER BY anno;", soluzione: "WITH annuale AS (\n  SELECT strftime('%Y', InvoiceDate) AS anno, SUM(Total) AS fatturato\n  FROM Invoice\n  GROUP BY anno\n)\nSELECT anno,\n       ROUND(fatturato, 2) AS fatturato,\n       ROUND(fatturato - LAG(fatturato) OVER (ORDER BY anno), 2) AS variazione\nFROM annuale\nORDER BY anno;", suggerimenti: ["`LAG(fatturato) OVER (ORDER BY anno)` è il fatturato dell'anno prima."] },
      { id: 'm10-e4', titolo: 'Progressivo del 2024', consegna: "Per i mesi del 2024 mostra `mese` (`'01'`, `'02'`…), `incasso` del mese e `progressivo`: la somma degli incassi da gennaio fino a quel mese. Tutto arrotondato a 2 decimali, in ordine di mese.", ordinato: true, iniziale: VUOTO, soluzione: "WITH mensile AS (\n  SELECT strftime('%m', InvoiceDate) AS mese, SUM(Total) AS incasso\n  FROM Invoice\n  WHERE strftime('%Y', InvoiceDate) = '2024'\n  GROUP BY mese\n)\nSELECT mese,\n       ROUND(incasso, 2) AS incasso,\n       ROUND(SUM(incasso) OVER (ORDER BY mese), 2) AS progressivo\nFROM mensile\nORDER BY mese;", suggerimenti: ['Prima l\'incasso per mese del 2024 in una CTE.', '`SUM(incasso) OVER (ORDER BY mese)` somma fino alla riga corrente.'] },
      { id: 'm10-e5', titolo: 'Il brano più lungo di ogni genere', consegna: 'Per ogni genere mostra `genere` (nome), `brano` (nome) e `Milliseconds` del brano più lungo. A parità di durata, quello con il `TrackId` più piccolo.', iniziale: VUOTO, soluzione: 'WITH classifica AS (\n  SELECT t.GenreId, t.Name, t.Milliseconds,\n         ROW_NUMBER() OVER (PARTITION BY t.GenreId ORDER BY t.Milliseconds DESC, t.TrackId) AS n\n  FROM Track AS t\n)\nSELECT g.Name AS genere, c.Name AS brano, c.Milliseconds\nFROM classifica AS c\nJOIN Genre AS g ON g.GenreId = c.GenreId\nWHERE c.n = 1;', suggerimenti: ['`ROW_NUMBER() OVER (PARTITION BY GenreId ORDER BY Milliseconds DESC, TrackId)` numera i brani di ogni genere dal più lungo.', 'Filtra `n = 1` fuori dalla CTE, e unisci `Genre` per il nome.'] },
    ],
  },

  {
    id: 'm11',
    titolo: 'Modificare i dati',
    sottotitolo: 'CREATE TABLE, INSERT, UPDATE, DELETE',
    teoria: `
Finora hai solo **letto** i dati. Questi comandi li **cambiano**:

- \`CREATE TABLE\` crea una tabella nuova, con nome e tipo di ogni colonna.
- \`INSERT INTO tabella (colonne) VALUES (valori)\` aggiunge righe.
- \`UPDATE tabella SET colonna = valore WHERE ...\` modifica righe esistenti.
- \`DELETE FROM tabella WHERE ...\` cancella righe.

**Attenzione al WHERE.** Un \`UPDATE\` o un \`DELETE\` senza \`WHERE\` agisce su **tutte** le righe della tabella. Un buon metodo: scrivi prima una \`SELECT\` con lo stesso WHERE, controlla che trovi le righe giuste, poi trasformala in UPDATE o DELETE.

In SQLite i tipi principali sono \`INTEGER\`, \`REAL\` (numeri con la virgola), \`TEXT\` e \`NUMERIC\`. Una colonna \`INTEGER PRIMARY KEY\` riceve un numero automatico se non lo indichi.

In questo laboratorio ogni **Verifica** parte da una copia nuova del database, quindi puoi sbagliare senza conseguenze. Nell'**area libera** le modifiche restano finché non premi "Reimposta database".
`,
    esempi: [
      { titolo: 'Creare e riempire una tabella', sql: "CREATE TABLE Prova (\n  ProvaId INTEGER PRIMARY KEY,\n  Nome    TEXT,\n  Voto    INTEGER\n);\nINSERT INTO Prova (Nome, Voto) VALUES ('Primo', 8), ('Secondo', 6);\nSELECT * FROM Prova;" },
      { titolo: 'Prima controlla, poi modifica', sql: '-- 1. Quali righe cambierei?\nSELECT TrackId, Name, UnitPrice FROM Track WHERE TrackId = 1;\n-- 2. Solo dopo averlo verificato:\n-- UPDATE Track SET UnitPrice = 1.29 WHERE TrackId = 1;' },
      { titolo: 'Un UPDATE e il suo effetto', sql: "UPDATE Genre SET Name = 'Rock classico' WHERE GenreId = 1;\nSELECT * FROM Genre WHERE GenreId <= 3;" },
    ],
    esercizi: [
      { id: 'm11-e1', tipo: 'modifica', titolo: 'Un genere nuovo', consegna: "Aggiungi alla tabella `Genre` un genere chiamato `Italo Disco`. Non indicare `GenreId`: lo assegna il database.", iniziale: '-- Scrivi qui il tuo INSERT\n', soluzione: "INSERT INTO Genre (Name)\nVALUES ('Italo Disco');", controllo: "SELECT Name FROM Genre WHERE Name = 'Italo Disco';", suggerimenti: ["`INSERT INTO Genre (Name) VALUES ('...')`"] },
      { id: 'm11-e2', tipo: 'modifica', titolo: 'Cambiare un solo prezzo', consegna: "Porta a 1.29 il prezzo (`UnitPrice`) del brano con `TrackId` 1, **e solo di quello**. La query di partenza è pericolosa: perché?", iniziale: 'UPDATE Track\nSET UnitPrice = 1.29;', soluzione: 'UPDATE Track\nSET UnitPrice = 1.29\nWHERE TrackId = 1;', controllo: 'SELECT TrackId, UnitPrice FROM Track WHERE TrackId <= 3 ORDER BY TrackId;', suggerimenti: ['Senza WHERE l\'UPDATE cambia tutti i 3.503 brani.'] },
      { id: 'm11-e3', tipo: 'modifica', titolo: 'Togliere le playlist vuote', consegna: 'Cancella dalla tabella `Playlist` tutte le playlist che non contengono nessun brano (cioè che non compaiono in `PlaylistTrack`).', iniziale: "DELETE FROM Playlist\nWHERE Name = 'Movies';", soluzione: 'DELETE FROM Playlist\nWHERE PlaylistId NOT IN (SELECT PlaylistId FROM PlaylistTrack);', controllo: 'SELECT PlaylistId, Name FROM Playlist ORDER BY PlaylistId;', suggerimenti: ['Prima trova le playlist vuote con una SELECT e `NOT IN`.', '`DELETE FROM Playlist WHERE PlaylistId NOT IN (SELECT PlaylistId FROM PlaylistTrack)`'] },
      { id: 'm11-e4', tipo: 'modifica', titolo: 'La tabella delle recensioni', consegna: "Crea una tabella `Recensione` con le colonne `RecensioneId` (INTEGER PRIMARY KEY), `AlbumId` (INTEGER), `Voto` (INTEGER) e `Testo` (TEXT). Poi inserisci due recensioni: album 1 con voto 5, album 2 con voto 4 (il testo è libero).", iniziale: 'CREATE TABLE Recensione (\n  RecensioneId INTEGER PRIMARY KEY,\n  AlbumId      INTEGER,\n  Voto         INTEGER,\n  Testo        TEXT\n);\n-- aggiungi qui le due recensioni\n', soluzione: "CREATE TABLE Recensione (\n  RecensioneId INTEGER PRIMARY KEY,\n  AlbumId      INTEGER,\n  Voto         INTEGER,\n  Testo        TEXT\n);\nINSERT INTO Recensione (AlbumId, Voto, Testo) VALUES\n  (1, 5, 'Un classico'),\n  (2, 4, 'Molto bello');", controllo: 'SELECT AlbumId, Voto FROM Recensione ORDER BY AlbumId;', suggerimenti: ['Un solo INSERT può aggiungere più righe: `VALUES (...), (...)`.'] },
      { id: 'm11-e5', tipo: 'modifica', titolo: 'Video più cari del 10%', consegna: 'Aumenta del 10% il prezzo di tutti i brani con `MediaTypeId` 3 (i video), arrotondando il nuovo prezzo a 2 decimali. Gli altri brani non devono cambiare.', iniziale: VUOTO, soluzione: 'UPDATE Track\nSET UnitPrice = ROUND(UnitPrice * 1.1, 2)\nWHERE MediaTypeId = 3;', controllo: 'SELECT MediaTypeId, ROUND(AVG(UnitPrice), 2) AS prezzo_medio FROM Track GROUP BY MediaTypeId ORDER BY MediaTypeId;', suggerimenti: ['`SET UnitPrice = ROUND(UnitPrice * 1.1, 2)`', 'Non dimenticare `WHERE MediaTypeId = 3`.'] },
    ],
  },

  {
    id: 'm12',
    titolo: 'Sfide finali',
    sottotitolo: 'Domande vere sul negozio',
    teoria: `
È il momento di mettere tutto insieme. Queste sono domande che un responsabile del negozio potrebbe farti davvero. Nessun suggerimento sulla struttura: decidi tu quali tabelle servono, se usare JOIN, GROUP BY, CTE o window function.

Un metodo che funziona sempre:

- Scrivi la domanda in italiano e individua cosa deve contenere **ogni riga** del risultato.
- Trova le tabelle e le colonne che servono, con il pannello **Schema**.
- Costruisci la query un passo alla volta, eseguendola spesso.
- Controlla i numeri: hanno senso?
`,
    esempi: [],
    esercizi: [
      { id: 'm12-e1', titolo: 'Il miglior venditore', consegna: "Per ogni dipendente che segue dei clienti mostra `FirstName`, `LastName` e `vendite`: il totale delle fatture dei suoi clienti, arrotondato a 2 decimali. Dal più alto.", ordinato: true, iniziale: VUOTO, soluzione: 'SELECT e.FirstName, e.LastName,\n       ROUND(SUM(i.Total), 2) AS vendite\nFROM Employee AS e\nJOIN Customer AS c ON c.SupportRepId = e.EmployeeId\nJOIN Invoice  AS i ON i.CustomerId = c.CustomerId\nGROUP BY e.EmployeeId\nORDER BY vendite DESC;', suggerimenti: ['Employee → Customer (con `SupportRepId`) → Invoice.', 'Raggruppa per dipendente.'] },
      { id: 'm12-e2', titolo: 'I clienti più affezionati', consegna: 'Mostra `FirstName`, `LastName` e `totale` (arrotondato a 2 decimali) dei clienti che hanno speso più di 45 in tutto.', iniziale: VUOTO, soluzione: 'SELECT c.FirstName, c.LastName,\n       ROUND(SUM(i.Total), 2) AS totale\nFROM Customer AS c\nJOIN Invoice AS i ON i.CustomerId = c.CustomerId\nGROUP BY c.CustomerId\nHAVING SUM(i.Total) > 45;', suggerimenti: ['Raggruppa per cliente e filtra con HAVING.'] },
      { id: 'm12-e3', titolo: 'Gli album più lunghi', consegna: "Mostra i 5 album con la durata totale più lunga: `album` (titolo), `artista` e `minuti` (somma delle durate dei brani in minuti, arrotondata a 1 decimale), dal più lungo.", ordinato: true, iniziale: VUOTO, soluzione: 'SELECT al.Title AS album,\n       ar.Name  AS artista,\n       ROUND(SUM(t.Milliseconds) / 60000.0, 1) AS minuti\nFROM Track AS t\nJOIN Album  AS al ON al.AlbumId = t.AlbumId\nJOIN Artist AS ar ON ar.ArtistId = al.ArtistId\nGROUP BY al.AlbumId\nORDER BY SUM(t.Milliseconds) DESC\nLIMIT 5;', suggerimenti: ['Somma i millisecondi per album, poi converti in minuti.'] },
      { id: 'm12-e4', titolo: 'Brani in molte playlist', consegna: 'Mostra `brano` (nome) e `playlist` (in quante playlist compare) dei brani presenti in almeno 5 playlist.', iniziale: VUOTO, soluzione: 'SELECT t.Name AS brano,\n       COUNT(*) AS playlist\nFROM PlaylistTrack AS pt\nJOIN Track AS t ON t.TrackId = pt.TrackId\nGROUP BY pt.TrackId\nHAVING COUNT(*) >= 5;', suggerimenti: ['Conta le righe di `PlaylistTrack` per ogni brano.'] },
      { id: 'm12-e5', titolo: 'Formati anno per anno', consegna: "Per ogni anno e ogni formato mostra `anno`, `formato` (il nome in `MediaType`) e `incasso` (prezzo × quantità delle righe di fattura, arrotondato a 2 decimali).", iniziale: VUOTO, soluzione: "SELECT strftime('%Y', i.InvoiceDate) AS anno,\n       mt.Name AS formato,\n       ROUND(SUM(il.UnitPrice * il.Quantity), 2) AS incasso\nFROM InvoiceLine AS il\nJOIN Invoice   AS i  ON i.InvoiceId = il.InvoiceId\nJOIN Track     AS t  ON t.TrackId = il.TrackId\nJOIN MediaType AS mt ON mt.MediaTypeId = t.MediaTypeId\nGROUP BY anno, mt.Name;", suggerimenti: ['Servono quattro tabelle: InvoiceLine, Invoice (per la data), Track, MediaType.', 'Si può raggruppare per due colonne: `GROUP BY anno, mt.Name`.'] },
      { id: 'm12-e6', titolo: 'Quota di fatturato per paese', consegna: 'Per ogni paese di fatturazione mostra `BillingCountry` e `percentuale`: la sua quota del fatturato totale, in percentuale, arrotondata a 1 decimale.', iniziale: VUOTO, soluzione: 'SELECT BillingCountry,\n       ROUND(100.0 * SUM(Total) / (SELECT SUM(Total) FROM Invoice), 1) AS percentuale\nFROM Invoice\nGROUP BY BillingCountry;', suggerimenti: ['La quota è: fatturato del paese / fatturato totale × 100.', 'Il fatturato totale si ottiene con una subquery.'] },
    ],
  },
];

/** Schema delle relazioni tra le tabelle, per il pannello Schema. */
export const RELAZIONI = [
  ['Album.ArtistId', 'Artist.ArtistId'],
  ['Track.AlbumId', 'Album.AlbumId'],
  ['Track.GenreId', 'Genre.GenreId'],
  ['Track.MediaTypeId', 'MediaType.MediaTypeId'],
  ['PlaylistTrack.PlaylistId', 'Playlist.PlaylistId'],
  ['PlaylistTrack.TrackId', 'Track.TrackId'],
  ['InvoiceLine.InvoiceId', 'Invoice.InvoiceId'],
  ['InvoiceLine.TrackId', 'Track.TrackId'],
  ['Invoice.CustomerId', 'Customer.CustomerId'],
  ['Customer.SupportRepId', 'Employee.EmployeeId'],
  ['Employee.ReportsTo', 'Employee.EmployeeId'],
];
