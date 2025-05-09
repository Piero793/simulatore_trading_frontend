# SimuTrade X

"SimuTrade X" è un'applicazione web interattiva che consente agli utenti di simulare l'acquisto e la vendita di asset finanziari in un ambiente virtuale. L'applicazione offre una piattaforma completa per il monitoraggio dei mercati, l'analisi dei prezzi e la gestione di un portafoglio virtuale, integrando anche aggiornamenti di notizie finanziarie.

## Prerequisiti

Assicurati di avere installato Node.js e npm sul tuo sistema. Puoi scaricarli da [https://nodejs.org/](https://nodejs.org/).

## Installazione

1.  Clona il repository:

    ```bash
    git clone https://github.com/Piero793/simulatore_trading_frontend.git

    ```

2.  Installa le dipendenze del frontend:

    npm install

## Configurazione

3.  Configurazione delle Variabili d'Ambiente
    Per far funzionare correttamente l'applicazione frontend, è necessario creare un file .env nella directory principale del progetto (simulatore_trading_frontend) e definire le seguenti variabili d'ambiente:

    VITE_API_BASE_URL=http://localhost:8080/api
    VITE_NEWS_API_BASE_URL=[https://newsapi.org/v2](https://newsapi.org/v2)
    VITE_NEWS_API_KEY=<la_tua_API_key_di_NewsAPI>

## Importante

1. Sostituisci <la_tua_API_key_di_NewsAPI> con la tua API key fornita da NewsAPI. Se non hai una chiave, puoi registrarti sul sito di NewsAPI per ottenerne una (è disponibile un piano gratuito per scopi di sviluppo).

2. VITE_API_BASE_URL punta all'endpoint base del backend sviluppato con Java Spring Boot. Assicurati che il server backend sia in esecuzione all'indirizzo specificato (http://localhost:8080/api in questo esempio) affinché il frontend possa recuperare i dati.

## Avvio dell'Applicazione Frontend

1. Per avviare l'applicazione frontend in modalità sviluppo (con Vite):
   npm run dev
   L'applicazione sarà disponibile all'indirizzo http://localhost:5173/ (o un altro indirizzo indicato nella console).

## Note Aggiuntive sul Frontend

1. Librerie Principali: Il frontend è sviluppato utilizzando React e utilizza Vite come strumento di build e server di sviluppo. Sono state utilizzate anche librerie come React Router DOM per la navigazione, React Bootstrap per i componenti dell'interfaccia utente e possibilmente Chart.js (tramite react-chartjs-2) per la visualizzazione dei grafici (GraficoAzioni). Il componente FinancialNews gestisce la visualizzazione delle ultime notizie finanziarie.
