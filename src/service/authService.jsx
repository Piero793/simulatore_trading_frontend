// registrazione e login

const API_URL = "http://localhost:8080/api";

const getJwtToken = () => sessionStorage.getItem("jwtToken");

const handleResponse = async (response) => {
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

// fetch azioni per dashboard
export const fetchAzioni = async () => {
  const token = getJwtToken();
  if (!token) {
    throw new Error("Token JWT non trovato.");
  }
  try {
    const response = await fetch(`${API_URL}/azioni`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`Errore nel recupero delle azioni: ${error.message}`);
  }
};

export const fetchAlert = async (assetId) => {
  const token = getJwtToken();
  if (!token) {
    throw new Error("Token JWT non trovato.");
  }
  try {
    const response = await fetch(`${API_URL}/previsione/alert/${assetId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    throw new Error(`Errore nel recupero dell'alert: ${error.message}`);
  }
};
