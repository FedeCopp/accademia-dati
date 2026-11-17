---
numero: 4
titolo: Intelligence e scala
mesi: Mesi 10–12
sintesi: Usi una piattaforma cloud, provi il primo machine learning e affronti un caso d'uso di intelligence sulle minacce informatiche.
strumenti: [Google Cloud, BigQuery, scikit-learn, OSINT, NVD / CVE, MITRE ATT&CK]
progetto: Sistema che raccoglie le nuove vulnerabilità (CVE), le classifica per gravità e prodotto e le mostra in dashboard.
risorse:
  - { titolo: "Google Cloud, BigQuery sandbox (gratuito)", url: "https://cloud.google.com/bigquery/docs/sandbox" }
  - { titolo: "scikit-learn, tutorial", url: "https://scikit-learn.org/stable/tutorial/index.html" }
  - { titolo: "Kaggle Learn, Intro to Machine Learning", url: "https://www.kaggle.com/learn/intro-to-machine-learning" }
  - { titolo: "NVD, API delle vulnerabilità", url: "https://nvd.nist.gov/developers/vulnerabilities" }
  - { titolo: "CISA, Known Exploited Vulnerabilities", url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog" }
---

## Argomenti, mese per mese

**Mese 10: cloud.** Una sola piattaforma, fatta bene. La sandbox di BigQuery è gratuita e non chiede la carta di credito: carichi i dati, li interroghi con lo stesso SQL che conosci, impari cosa costa una query.

**Mese 11: machine learning introduttivo.** Regressione e classificazione con scikit-learn, divisione train/test, metriche, overfitting. L'obiettivo è capire quando il ML serve e quando basta una query.

**Mese 12: intelligence.** Fonti aperte (OSINT), feed di vulnerabilità dal NVD e dal catalogo CISA delle vulnerabilità sfruttate, normalizzazione dei dati e collegamento alle tecniche del framework MITRE ATT&CK.

## Il progetto è finito quando

- I dati CVE si aggiornano in automatico ogni giorno.
- La dashboard mostra le vulnerabilità per gravità, prodotto e data.
- Le vulnerabilità già sfruttate sono evidenziate.
- Il README spiega le fonti e i loro limiti.
