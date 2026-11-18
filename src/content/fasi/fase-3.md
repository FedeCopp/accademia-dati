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

Negli annunci per data analyst in Italia lo strumento di dashboard più citato è **Power BI**. Se punti al lavoro in azienda, nei mesi 8 e 9 puoi costruire la dashboard del progetto in Power BI invece che in Streamlit. **Power BI Desktop** è gratuito, ma funziona solo su Windows: su Mac serve una macchina virtuale o il servizio web.

### Costruire una dashboard, passo passo

1. **Importa i dati**: da "Recupera dati" collegati al database della Fase 2 o a un file.
2. **Sistema il modello**: nella vista modello collega le tabelle con le chiavi, per esempio vendite e prodotti tramite il codice prodotto. È lo schema a stella della Fase 2.
3. **Crea le misure** in DAX, il linguaggio delle formule di Power BI. Per esempio `Incasso = SUM(vendite[importo])`.
4. **Disegna i visual**: trascina misure e colonne su grafici, tabelle e schede numeriche.
5. **Aggiungi i filtri** (slicer) per anno, regione e categoria. Tutti i visual della pagina si aggiornano insieme.

### Contesto di filtro e contesto di riga

È il concetto che confonde di più all'inizio.

- **Contesto di riga**: una formula calcolata **riga per riga**, come una colonna calcolata. `Importo = vendite[quantita] * vendite[prezzo]` guarda solo la riga in cui si trova.
- **Contesto di filtro**: una **misura** viene calcolata sui dati rimasti dopo i filtri attivi, cioè slicer, righe della tabella e barre del grafico. La stessa misura `Incasso` dà un numero diverso in ogni barra perché ogni barra filtra una categoria diversa.

Regola pratica: per calcoli su una singola riga usa una colonna calcolata; per totali, medie e percentuali che devono rispondere ai filtri usa una misura.

### Drill through

Il **drill through** permette di passare da un riepilogo al dettaglio. Crei una pagina "Dettaglio prodotto" e indichi il campo prodotto come filtro di drill through. Poi, da qualsiasi grafico, clic destro su un prodotto e "Drill through": si apre la pagina di dettaglio già filtrata su quel prodotto.

Streamlit resta la scelta migliore se vuoi una dashboard pubblica e gratuita da mettere nel portfolio.
