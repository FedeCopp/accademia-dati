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
video:
  - { titolo: "Processo di ETL: che cos'è?", url: "https://www.youtube.com/watch?v=VcC0Q2Oc_8Y", autore: "Mirco Miglietta" }
  - { titolo: "SQL vs SSIS vs Python: 3 modi per creare un ETL", url: "https://www.youtube.com/watch?v=PUz5qr_EMTI", autore: "Mirco Miglietta" }
  - { titolo: "Indici in SQL: come velocizzare le query", url: "https://www.youtube.com/watch?v=m1ucJnZYlC8", autore: "Mirco Miglietta", nota: "mese 5" }
  - { titolo: "Corso SSIS completo (11 video)", url: "https://www.youtube.com/playlist?list=PLcbGJIjNIkhN9VEpg114x9QLzN98OySg4", autore: "Mirco Miglietta", nota: "facoltativo: l'ETL nello stack Microsoft" }
---

## Argomenti, mese per mese

**Mese 4: raccogliere.** Chiamate HTTP a un'API con `requests`, paginazione, salvataggio dei dati grezzi in JSON e Parquet. Docker quanto basta per far girare PostgreSQL in locale.

**Mese 5: modellare.** Schema a stella: tabella dei fatti e tabelle delle dimensioni. dbt per scrivere le trasformazioni in SQL, con test (`not_null`, `unique`) e documentazione generata.

**Mese 6: automatizzare.** Prefect (più semplice di Airflow per iniziare) per eseguire la pipeline ogni giorno, con log e notifica se qualcosa fallisce.

## Il progetto è finito quando

- La pipeline si esegue con un solo comando, descritto nel README.
- I dati grezzi e quelli trasformati sono separati.
- Almeno cinque test dbt passano.
- C'è un diagramma dello schema delle tabelle.

## Prestazioni: gli indici

Quando le tabelle crescono, una query può diventare lenta. Un **indice** è come l'indice di un libro: permette al database di trovare le righe senza leggerle tutte. Nel mese 5 prova a misurare la stessa query su PostgreSQL con e senza indice (`EXPLAIN ANALYZE`).

## Nello stack Microsoft

Molte aziende italiane usano SQL Server. Lì l'ETL si fa spesso con **SSIS** (SQL Server Integration Services), che svolge lo stesso ruolo di Prefect e dbt con un'interfaccia grafica. Non serve impararlo ora, ma è utile riconoscerlo negli annunci di lavoro.
