import { useState, useEffect, useCallback } from "react";
import { Table, Container, Spinner, Alert, Card } from "react-bootstrap";
import PropTypes from "prop-types";
import DettaglioAzione from "../components/DettaglioAzione";
import { useNavigate } from "react-router-dom";
import {
  fetchPortfolio as fetchPortfolioApi,
  fetchTransazioniPortfolio as fetchTransazioniPortfolioApi,
} from "../service/apiService";

const Portfolio = ({ aggiornaPortfolio }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transazioniPortfolio, setTransazioniPortfolio] = useState([]);
  const navigate = useNavigate();

  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      sessionStorage.removeItem("jwtToken");
      navigate("/");
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
    },
    [navigate]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadPortfolioData = async () => {
      try {
        const portfolioData = await fetchPortfolioApi();
        setPortfolio(portfolioData);
        const transazioniData = await fetchTransazioniPortfolioApi();
        setTransazioniPortfolio(transazioniData);
      } catch (err) {
        console.error("Errore nel recupero dei dati del portfolio:", err);
        if (err.message === "Token JWT non trovato.") {
          handleAuthError(401);
        } else {
          setError(`❌ Errore nel recupero del portfolio: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPortfolioData();
  }, [aggiornaPortfolio, handleAuthError]);

  const haAzioni = portfolio?.azioni?.some((azione) => azione.quantita > 0);

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
      ) : haAzioni ? (
        <>
          <Table striped bordered hover responsive className="text-center portfolio-table">
            <thead className="table-dark">
              <tr>
                <th> Nome Azione</th>
                <th> Quantità</th>
                <th> Valore Attuale (€)</th>
                <th> Variazione %</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.azioni
                .filter((azione) => azione.quantita > 0)
                .map((azione, index) => (
                  <tr
                    key={index}
                    onClick={() => setAzioneSelezionata(azione)}
                    style={{ cursor: "pointer" }}
                    className="portfolio-row"
                  >
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

          <Alert variant="success" className="mt-3 text-center portfolio-total">
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

          {/* Cronologia Transazioni */}
          <h2 className="text-center mt-5 text-white">Cronologia Transazioni</h2>
          {transazioniPortfolio.length > 0 ? (
            <Card className="mt-3 transaction-history-card">
              <Card.Body>
                <ul className="transaction-list">
                  {transazioniPortfolio.map((transazione) => (
                    <li key={transazione.id} className="transaction-item text-white">
                      <strong>{transazione.tipoTransazione}:</strong> <span>{transazione.quantita}x</span>{" "}
                      <strong>{transazione.nomeAzione}</strong> per un totale di €{" "}
                      <span>{(transazione.quantita * transazione.prezzoUnitario).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          ) : (
            <Alert variant="info" className="mt-3 text-center no-transactions-alert">
              Nessuna transazione registrata nel portfolio.
            </Alert>
          )}
        </>
      ) : (
        <Alert variant="warning">Il portfolio è vuoto, acquista la tua prima azione!</Alert>
      )}
    </Container>
  );
};

Portfolio.propTypes = {
  aggiornaPortfolio: PropTypes.number.isRequired,
};

export default Portfolio;
