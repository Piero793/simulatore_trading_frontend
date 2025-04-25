import { useState, useEffect } from "react";
import { Table, Container, Spinner, Alert } from "react-bootstrap";
import PropTypes from "prop-types"; // 👈 Importa PropTypes (anche se lo rimuoveremo per nomeUtente)
import DettaglioAzione from "../components/DettaglioAzione";

const Portfolio = ({ aggiornaPortfolio }) => {
  // 👈 Rimuovi nomeUtente dalle props
  const [portfolio, setPortfolio] = useState(null);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Recupera il portfolio ogni volta che `aggiornaPortfolio` cambia
  useEffect(() => {
    setLoading(true); // Imposta il caricamento all'inizio di ogni fetch
    setError(null); // Resetta l'errore

    fetch(`http://localhost:8080/api/portfolio`) // 👈 URL modificato: niente più /{nomeUtente}
      .then((response) => {
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("DEBUG - Portfolio ricevuto:", data); // Debug per verificare i dati ricevuti
        setPortfolio(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore nel recupero del portfolio:", error);
        setError("❌ Errore nel recupero del portfolio.");
        setLoading(false);
      });
  }, [aggiornaPortfolio]); // 👈 Rimuovi nomeUtente dalle dipendenze

  return (
    <Container className="portfolio-container">
      <h2 className="text-center my-4">📌 Il tuo Portfolio</h2>
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
                <th>📈 Nome Azione</th>
                <th>📦 Quantità</th>
                <th>💰 Valore Attuale (€)</th>
                <th>📊 Variazione %</th>
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
                  </td>{" "}
                  <td className={azione.variazione >= 0 ? "text-success" : "text-danger"}>
                    {azione.variazione ? azione.variazione.toFixed(2) : "N/D"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Alert variant="success" className="mt-3 text-center">
            💰 **Totale Investito:** €
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
        </>
      ) : (
        <Alert variant="warning">🔹 Il portfolio è vuoto, acquista la tua prima azione!</Alert>
      )}
    </Container>
  );
};

// Validazione per eliminare l'errore ESLint
Portfolio.propTypes = {
  aggiornaPortfolio: PropTypes.number.isRequired,
};

export default Portfolio;
