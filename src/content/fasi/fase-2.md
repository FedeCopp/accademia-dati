---
numero: 2
titolo: Trasformare i dati
mesi: Mesi 4–6
sintesi: Passi dai file sparsi a un database ordinato. Estrai, pulisci, modelli in schema a stella e automatizzi tutto.
strumenti: [ETL / ELT, API REST, DuckDB, PostgreSQL, dbt, Prefect, Docker, Indici]
progetto: Pipeline che ogni giorno scarica dati da un'API pubblica, li pulisce e li carica in un database con modelli dbt testati.
risorse:
  - { titolo: "DataTalks.Club, Data Engineering Zoomcamp (gratuito)", url: "https://github.com/DataTalksClub/data-engineering-zoomcamp" }
  - { titolo: "dbt, corsi gratuiti", url: "https://learn.getdbt.com/catalog" }
  - { titolo: "Documentazione DuckDB", url: "https://duckdb.org/docs/" }
  - { titolo: "Kimball Group, tecniche di modellazione dimensionale", url: "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/" }
---

## Argomenti, mese per mese

**Mese 4: raccogliere.** Chiamate HTTP a un'API con `requests`, paginazione, salvataggio dei dati grezzi in JSON e Parquet. Docker quanto basta per far girare PostgreSQL in locale.

**Mese 5: modellare.** Schema a stella: tabella dei fatti e tabelle delle dimensioni. dbt per scrivere le trasformazioni in SQL, con test (`not_null`, `unique`) e documentazione generata.

**Mese 6: automatizzare.** Prefect (più semplice di Airflow per iniziare) per eseguire la pipeline ogni giorno, con log e notifica se qualcosa fallisce.

## Che cos'è un processo ETL

**ETL** sta per *Extract, Transform, Load*: estrarre, trasformare, caricare. È il percorso che porta i dati dalle fonti al database su cui si fanno le analisi.

1. **Extract**: prendi i dati dove sono, per esempio un'API, file CSV in una cartella o il gestionale dell'azienda.
2. **Transform**: li pulisci, uniformi formati e nomi, togli i duplicati, calcoli colonne nuove e colleghi tabelle diverse.
3. **Load**: li salvi nel database di destinazione, in tabelle pronte per le dashboard.

Oggi si usa spesso l'**ELT**: prima si caricano i dati grezzi nel database, poi si trasformano lì dentro con SQL (è il lavoro di dbt). Così i dati originali restano sempre disponibili.

## Tre modi per costruire un ETL

| | SQL (con dbt) | SSIS | Python (con Prefect) |
| --- | --- | --- | --- |
| Come si lavora | query SQL in file versionati | interfaccia grafica a blocchi | script e funzioni |
| Dove si trova | aziende con data warehouse moderno | aziende con SQL Server | team di data engineering |
| Punto forte | semplice, testabile, leggibile | integrato nello stack Microsoft | flessibile: API, file, qualsiasi fonte |
| Punto debole | serve un database che faccia il lavoro | solo Windows e SQL Server | più codice da mantenere |

In questa fase usi Python per estrarre e caricare e SQL con dbt per trasformare: è la combinazione più diffusa.

## Il progetto è finito quando

- La pipeline si esegue con un solo comando, descritto nel README.
- I dati grezzi e quelli trasformati sono separati.
- Almeno cinque test dbt passano.
- C'è un diagramma dello schema delle tabelle.

## Prestazioni: gli indici

Quando le tabelle crescono, una query può diventare lenta. Un **indice** è come l'indice di un libro: permette al database di trovare le righe senza leggerle tutte. Nel mese 5 prova a misurare la stessa query su PostgreSQL con e senza indice (`EXPLAIN ANALYZE`).

## Nello stack Microsoft

Molte aziende italiane usano SQL Server. Lì l'ETL si fa spesso con **SSIS** (SQL Server Integration Services), che svolge lo stesso ruolo di Prefect e dbt con un'interfaccia grafica. Non serve impararlo ora, ma è utile riconoscerlo negli annunci di lavoro.
