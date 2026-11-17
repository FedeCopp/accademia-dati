---
numero: 3
titolo: Capire e comunicare
mesi: Mesi 7–9
sintesi: Trasformi tabelle in risposte. Statistica pratica, grafici onesti e dashboard che qualcuno usa davvero.
strumenti: [Statistica descrittiva, Test A/B, Matplotlib, Plotly, Streamlit, Power BI, Metabase]
progetto: Dashboard pubblica costruita sulla pipeline della Fase 2, con tre insight scritti in linguaggio semplice.
risorse:
  - { titolo: "Khan Academy, statistica e probabilità", url: "https://www.khanacademy.org/math/statistics-probability" }
  - { titolo: "Streamlit, documentazione", url: "https://docs.streamlit.io/" }
  - { titolo: "Metabase, Learn", url: "https://www.metabase.com/learn/" }
  - { titolo: "Kaggle Learn, Data Visualization", url: "https://www.kaggle.com/learn/data-visualization" }
video:
  - { titolo: "Dashboard interattiva in Power BI, passo passo", url: "https://www.youtube.com/watch?v=gus_ssPa8SM", autore: "Mirco Miglietta", nota: "il punto di partenza" }
  - { titolo: "Analisi delle vendite con SQL e Power BI", url: "https://www.youtube.com/watch?v=su0S9X7ONk4", autore: "Mirco Miglietta" }
  - { titolo: "Power BI: contesto di filtro e contesto di riga", url: "https://www.youtube.com/watch?v=WGasMjm0aKc", autore: "Mirco Miglietta" }
  - { titolo: "Power BI: drill through per il dettaglio", url: "https://www.youtube.com/watch?v=ue5r5e0BqMg", autore: "Mirco Miglietta" }
---

## Argomenti, mese per mese

**Mese 7: statistica pratica.** Media e mediana, distribuzioni, varianza, correlazione (e perché non è causalità), intervalli di confidenza, un test A/B dall'inizio alla fine.

**Mese 8: visualizzazione.** Scegliere il grafico in base alla domanda, togliere tutto ciò che non serve, titoli che dicono la conclusione, colori accessibili.

**Mese 9: dashboard e racconto.** Streamlit per una dashboard in Python, oppure Power BI o Metabase collegati al database della Fase 2. Scrivere un breve report che porta a una decisione.

## Il progetto è finito quando

- La dashboard è online e legge dati aggiornati.
- Ogni grafico risponde a una domanda scritta sopra il grafico.
- C'è una pagina con tre insight e i limiti dei dati.

## Power BI, l'alternativa più richiesta

Negli annunci per data analyst in Italia lo strumento di dashboard più citato è **Power BI**. Se punti al lavoro in azienda, nei mesi 8 e 9 puoi costruire la dashboard del progetto in Power BI invece che in Streamlit:

- **Power BI Desktop** è gratuito, ma funziona solo su Windows. Su Mac serve una macchina virtuale o il servizio web.
- Si collega direttamente al database della Fase 2.
- Il concetto chiave da capire è la differenza tra **contesto di filtro** e **contesto di riga** nelle formule DAX.

Streamlit resta la scelta migliore se vuoi una dashboard pubblica e gratuita da mettere nel portfolio.
