import { API_URL, handleResponse } from "./config";

const NEWS_API_BASE_URL = import.meta.env.VITE_NEWS_API_BASE_URL;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const getJwtToken = () => sessionStorage.getItem("jwtToken");

const authedFetch = async (url, options = {}) => {
  const token = getJwtToken();
  if (!token) throw new Error("Token JWT non trovato.");
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(url, { ...options, headers });
  return handleResponse(response);
};

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

export const fetchAzioni = async () => authedFetch(`${API_URL}/azioni`);
export const fetchSaldo = async () => authedFetch(`${API_URL}/utenti/saldo`);
export const creaTransazione = async (transazione) =>
  authedFetch(`${API_URL}/transazioni`, { method: "POST", body: JSON.stringify(transazione) });
export const fetchAlert = async (assetId) => authedFetch(`${API_URL}/previsione/alert/${assetId}`);
export const fetchPrevisione = async (assetId) => authedFetch(`${API_URL}/previsione/${assetId}`);

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
