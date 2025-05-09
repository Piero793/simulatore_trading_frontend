// Questo file di configurazione contiene le variabili globali e le funzioni di utilità
// per interagire con l'API del backend. Definisce l'URL base dell'API e una funzione
// per gestire le risposte HTTP, inclusa la gestione degli errori e il parsing delle risposte JSON.

export const API_URL = process.env.REACT_APP_API_BASE_URL;

export const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
  }
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch (e) {
      console.error("Errore nel parsing JSON:", e);
      return await response.text();
    }
  } else {
    return await response.text();
  }
};
