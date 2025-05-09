// Questo file contiene tutte le funzioni per interagire con le API del backend.
// Ogni funzione esegue una chiamata HTTP a un endpoint specifico, gestendo l'autenticazione
// tramite token JWT (dove necessario) e la gestione delle risposte.
// Include funzioni per l'autenticazione (login, registrazione), per la gestione della
// simulazione di trading (azioni, saldo, creazione transazioni), per la visualizzazione
// di previsioni (alert, previsioni dettagliate), per la gestione del portfolio dell'utente
// e per la visualizzazione della cronologia delle transazioni.
// Inoltre, include una funzione per recuperare notizie finanziarie da un'API esterna.

import { API_URL, handleResponse } from "./config";

// news api
const NEWS_API_BASE_URL = process.env.REACT_APP_NEWS_API_BASE_URL;
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY;

const getJwtToken = () => sessionStorage.getItem("jwtToken");

// Funzione di utilità per le chiamate API autenticate
const authedFetch = async (url, options = {}) => {
  const token = getJwtToken();
  if (!token) {
    throw new Error("Token JWT non trovato.");
  }
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
};

// Login e registrazione
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`Errore login: ${error.message}`);
  }
};

export const register = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/utenti/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (response.status !== 201) {
      const errorText = await response.text();
      throw new Error(`Errore HTTP: ${response.status} - ${errorText}`);
    }
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`Errore registrazione: ${error.message}`);
  }
};

// Simulazione - fetch azioni
export const fetchAzioni = async () => authedFetch(`${API_URL}/azioni`);

// Simulazione - fetch saldo
export const fetchSaldo = async () => authedFetch(`${API_URL}/utenti/saldo`);

// Simulazione - post transazione
export const creaTransazione = async (transazione) =>
  authedFetch(`${API_URL}/transazioni`, { method: "POST", body: JSON.stringify(transazione) });

// Previsione alert
export const fetchAlert = async (assetId) => authedFetch(`${API_URL}/previsione/alert/${assetId}`);

// Previsione
export const fetchPrevisione = async (assetId) => authedFetch(`${API_URL}/previsione/${assetId}`);

// Financial News
export const fetchFinancialNews = async () => {
  const endpoint = `${NEWS_API_BASE_URL}/top-headlines?country=us&category=business&apiKey=${NEWS_API_KEY}`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Errore API News: ${response.status} - ${JSON.stringify(errorData)}`);
  }
  const data = await response.json();
  return data.articles;
};

// Portfolio
export const fetchPortfolio = async () => {
  try {
    return await authedFetch(`${API_URL}/portfolio/me`);
  } catch (error) {
    if (error.message === "Errore HTTP: 404") {
      console.error(
        "Errore 404: Endpoint /api/portfolio/me non trovato nel backend O Portfolio non trovato per l'utente."
      );
      throw new Error("Endpoint non trovato o Portfolio non esistente");
    }
    throw error;
  }
};

// Transazioni Portfolio
export const fetchTransazioniPortfolio = async () => {
  try {
    return await authedFetch(`${API_URL}/transazioni/me`);
  } catch (error) {
    if (error.message === "Errore HTTP: 404") {
      console.error(
        "Errore 404: Endpoint /api/transazioni/me non trovato nel backend O Transazioni non trovate per l'utente."
      );
      throw new Error("Endpoint non trovato o Transazioni non esistenti");
    }
    throw error;
  }
};
