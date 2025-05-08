const API_URL = "http://localhost:8080/api";

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error(await response.text());
    return await response.json();
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

    if (response.status !== 201) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    throw new Error(`Errore registrazione: ${error.message}`);
  }
};
