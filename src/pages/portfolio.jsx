import { useState, useEffect } from "react";
import { Table, Container, Spinner, Alert, Card } from "react-bootstrap";
import PropTypes from "prop-types";
import DettaglioAzione from "../components/DettaglioAzione";

const Portfolio = ({ aggiornaPortfolio, utenteLoggato }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transazioniPortfolio, setTransazioniPortfolio] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    console.log("DEBUG - Nome utente per la richiesta portfolio:", utenteLoggato?.nome); // Verifica il nome utente

    fetch(`http://localhost:8080/api/portfolio?nomeUtente=${utenteLoggato?.nome}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("DEBUG - Portfolio ricevuto:", data);
        setPortfolio(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore nel recupero del portfolio:", error);
        setError("❌ Errore nel recupero del portfolio.");
        setLoading(false);
      });

    // Recupera anche le transazioni specifiche per il portfolio
    fetch(`http://localhost:8080/api/transazioni?nomeUtente=${utenteLoggato?.nome}`)
      .then((response) => {
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        console.log("DEBUG - Transazioni ricevute per il portfolio:", data);
        setTransazioniPortfolio(data);
      })
      .catch((error) => {
        console.error("Errore nel recupero delle transazioni per il portfolio:", error);
      });
  }, [aggiornaPortfolio, utenteLoggato?.nome]);

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
                  </td>
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
