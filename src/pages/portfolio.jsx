import { useState, useEffect, useCallback } from "react";
import { Table, Container, Spinner, Alert, Card } from "react-bootstrap";
import PropTypes from "prop-types";
import DettaglioAzione from "../components/DettaglioAzione";
import { useNavigate } from "react-router-dom";

const Portfolio = ({ aggiornaPortfolio, utenteLoggato }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transazioniPortfolio, setTransazioniPortfolio] = useState([]);

  const navigate = useNavigate();

  const getJwtToken = () => {
    return localStorage.getItem("jwtToken");
  };

  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      localStorage.removeItem("jwtToken"); // Rimuove il token
      navigate("/");
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
    },
    [navigate]
  );

  useEffect(() => {
    // Questo controllo è importante per evitare chiamate API con un nome utente non definito o vuoto.
    if (!utenteLoggato?.nome || typeof utenteLoggato.nome !== "string" || utenteLoggato.nome.trim() === "") {
      console.log("DEBUG - utenteLoggato?.nome non definito, vuoto o non valido. Non recupero portfolio.");
      setLoading(false);
      setError("Utente non definito o non valido. Effettua il login.");
      return;
    }

    setLoading(true);
    setError(null);

    const token = getJwtToken();
    if (!token) {
      handleAuthError(401);
      setLoading(false);
      return;
    }

    console.log("DEBUG - Nome utente VALIDO per la richiesta portfolio:", utenteLoggato.nome);

    console.log(`DEBUG - Effettuo fetch GET su /api/portfolio con nomeUtente=${utenteLoggato.nome}`);
    fetch(`http://localhost:8080/api/portfolio?nomeUtente=${utenteLoggato.nome}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(response.status);
          return null;
        }
        if (!response.ok) {
          if (response.status === 404) {
            console.error(
              "Errore 404: Endpoint Portfolio non trovato nel backend O Portfolio non trovato per l'utente."
            );
            throw new Error(`Errore HTTP: ${response.status} - Endpoint non trovato o Portfolio non esistente`);
          }
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data !== null) {
          console.log("DEBUG - Portfolio ricevuto:", data);
          setPortfolio(data);
        }
      })
      .catch((error) => {
        console.error("Errore nel recupero del portfolio:", error);
        setError(`❌ Errore nel recupero del portfolio: ${error.message || error}`);
        setLoading(false);
      });

    console.log(`DEBUG - Effettuo fetch GET su /api/transazioni con nomeUtente=${utenteLoggato.nome}`);
    fetch(`http://localhost:8080/api/transazioni?nomeUtente=${utenteLoggato.nome}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.status === 401 || response.status === 403) {
          handleAuthError(response.status);
          return null;
        }
        if (!response.ok) {
          if (response.status === 404) {
            console.error(
              "Errore 404: Endpoint Transazioni non trovato nel backend O Transazioni non trovate per l'utente."
            );
            throw new Error(`Errore HTTP: ${response.status} - Endpoint non trovato o Transazioni non esistenti`);
          }
          throw new Error(`Errore HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data !== null) {
          console.log("DEBUG - Transazioni ricevute per il portfolio:", data);
          setTransazioniPortfolio(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Errore nel recupero delle transazioni per il portfolio:", error);
        setError(`❌ Errore nel recupero delle transazioni: ${error.message || error}`);
        setLoading(false);
      });
  }, [aggiornaPortfolio, utenteLoggato?.nome, handleAuthError]);

  return (
    <Container className="portfolio-container">
      <h2 className="text-center my-4"> Il tuo Portfolio</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Caricamento dati...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : portfolio && portfolio.azioni?.length > 0 ? (
        <>
          <Table striped bordered hover responsive className="text-center">
            <thead className="table-dark">
              <tr>
                <th> Nome Azione</th>
                <th> Quantità</th>
                <th> Valore Attuale (€)</th>
                <th> Variazione %</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.azioni.map((azione, index) => (
                <tr key={index} onClick={() => setAzioneSelezionata(azione)} style={{ cursor: "pointer" }}>
                  <td>{azione.nome || "N/D"}</td>
                  <td>{azione.quantita ?? "N/D"}</td>
                  <td>
                    {azione.valoreAttuale && azione.quantita
                      ? (azione.valoreAttuale * azione.quantita).toFixed(2)
                      : "N/D"}
                  </td>
                  <td className={azione.variazione >= 0 ? "text-success" : "text-danger"}>
                    {azione.variazione ? azione.variazione.toFixed(2) : "N/D"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Alert variant="success" className="mt-3 text-center">
            Totale Investito: €
            {portfolio.azioni
              .reduce((acc, azione) => acc + (azione.valoreAttuale ?? 0) * (azione.quantita ?? 1), 0)
              .toFixed(2)}
          </Alert>

          {azioneSelezionata && (
            <DettaglioAzione
              show={!!azioneSelezionata}
              handleClose={() => setAzioneSelezionata(null)}
              azione={azioneSelezionata}
            />
          )}

          {/* Inserimento della Cronologia Transazioni */}
          <h2 className="text-center mt-5">Cronologia Transazioni</h2>
          {transazioniPortfolio.length > 0 ? (
            <Card className="mt-3">
              <Card.Body>
                <ul>
                  {transazioniPortfolio.map((transazione) => (
                    <li key={transazione.id}>
                      <strong>{transazione.tipoTransazione}:</strong> {transazione.quantita}x{" "}
                      <strong>{transazione.nomeAzione}</strong> per un totale di €
                      {(transazione.quantita * transazione.prezzoUnitario).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info" className="mt-3 text-center">
              Nessuna transazione registrata nel portfolio.
            </Alert>
          )}
        </>
      ) : (
        <Alert variant="warning"> Il portfolio è vuoto, acquista la tua prima azione!</Alert>
      )}
    </Container>
  );
};

Portfolio.propTypes = {
  aggiornaPortfolio: PropTypes.number.isRequired,
  utenteLoggato: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    id: PropTypes.number,
  }),
};

export default Portfolio;
