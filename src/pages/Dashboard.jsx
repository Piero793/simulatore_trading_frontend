import { Card, Col, Container, Row, Spinner, Form, Alert } from "react-bootstrap";
import GraficoAzioni from "../components/GraficoAzioni";
import { useState, useEffect, useCallback } from "react";
import { FaBell } from "react-icons/fa";
import PropTypes from "prop-types";
// import FinancialNews from "./FinancialNews";
import { useNavigate } from "react-router-dom";

const Dashboard = ({ utenteLoggato }) => {
  const [loading, setLoading] = useState(true);
  const [azioni, setAzioni] = useState([]);
  const [assetSelezionato, setAssetSelezionato] = useState(null);
  const [alertMessaggio, setAlertMessaggio] = useState("");
  const [mostraAlert, setMostraAlert] = useState(false);

  const navigate = useNavigate();

  const getJwtToken = () => {
    return localStorage.getItem("jwtToken");
  };

  // Funzione per gestire gli errori di autenticazione/autorizzazione
  // Rimuove il token non valido e reindirizza al login.
  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      localStorage.removeItem("jwtToken"); // Rimuove il token
      navigate("/");
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
    },
    [navigate]
  );

  const fetchDati = useCallback(async () => {
    const token = getJwtToken();
    if (!token) {
      handleAuthError(401);
      return;
    }

    try {
      console.log("DEBUG - Fetching dati...");

      const azioniRes = await fetch("http://localhost:8080/api/azioni", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (azioniRes.status === 401 || azioniRes.status === 403) {
        handleAuthError(azioniRes.status);
        return;
      }
      if (!azioniRes.ok) throw new Error(`Errore API Azioni: ${azioniRes.status} - ${azioniRes.statusText}`);

      const azioniData = await azioniRes.json();

      console.log("DEBUG - Azioni ricevute:", azioniData);

      setAzioni(azioniData);

      // Se non ci sono transazioni iniziali, forziamo un assetSelezionato
      if (azioniData.length > 0 && assetSelezionato === null) {
        setAssetSelezionato(azioniData[0].id);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
    } finally {
      setLoading(false);
    }
  }, [assetSelezionato, handleAuthError]);

  const fetchAlert = useCallback(
    async (assetId) => {
      const token = getJwtToken();
      if (!token) {
        handleAuthError(401);
        return;
      }

      try {
        console.log(`DEBUG - Richiesta alert per asset ID: ${assetId}`);

        const response = await fetch(`http://localhost:8080/api/previsione/alert/${assetId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          handleAuthError(response.status);
          return;
        }

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status}`);
        }

        const alertData = await response.text();
        console.log("DEBUG - Alert ricevuto:", alertData);

        setAlertMessaggio(alertData.includes("🚨") ? alertData : "✅ Nessuna variazione significativa.");
      } catch (error) {
        console.error("Errore nel recupero dell'alert:", error);
        setAlertMessaggio(`❌ Errore nel recupero dell'alert: ${error.message}`);
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    // Al montaggio del componente, controlla se c'è un token.
    // Se non c'è, reindirizza al login.
    const token = getJwtToken();
    if (!token) {
      handleAuthError(401);
      return;
    }

    fetchDati();
    const interval = setInterval(() => {
      fetchDati();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchDati, handleAuthError]);

  useEffect(() => {
    if (assetSelezionato !== null) {
      fetchAlert(assetSelezionato);
    }
  }, [assetSelezionato, fetchAlert]);

  const handleBellClick = () => {
    setMostraAlert(!mostraAlert);
  };

  return (
    <Container className="dashboard-container">
      <h2 className="text-center my-4"> Analisi del Mercato</h2>

      {utenteLoggato?.nome && <p className="text-center mb-3">Benvenuto, {utenteLoggato.nome}!</p>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Caricamento dati...</p>
        </div>
      ) : (
        <>
          {/* Selezione asset */}
          <Row>
            <Col md={12} className="mb-3 text-center">
              <Form.Select value={assetSelezionato || ""} onChange={(e) => setAssetSelezionato(Number(e.target.value))}>
                {azioni.map((azione) => (
                  <option key={azione.id} value={azione.id}>
                    {azione.nome}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Grafico e Statistiche */}
          <Row>
            <Col md={8} className="mb-4">
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title> Andamento del Prezzo delle Azioni</Card.Title>
                  {azioni.length > 0 && assetSelezionato !== null ? (
                    <GraficoAzioni
                      data={azioni.filter((azione) => azione.id === assetSelezionato)}
                      transazioni={[]}
                      assetId={assetSelezionato}
                    />
                  ) : (
                    <p>Seleziona un asset per visualizzare il grafico.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>
                    Statistiche
                    <FaBell
                      style={{ cursor: "pointer", marginLeft: "10px", color: "#ff9800" }}
                      onClick={handleBellClick}
                    />
                  </Card.Title>

                  {/* Mostra statistiche dell'asset selezionato */}
                  {azioni.length > 0 && assetSelezionato !== null ? (
                    <>
                      <p>
                        <strong>Ultimo Prezzo:</strong> €
                        {azioni.find((az) => az.id === assetSelezionato)?.valoreAttuale.toFixed(2) || "N/A"}
                      </p>
                      <p>
                        <strong>Variazione Giornaliera:</strong>
                        <span
                          className={
                            (azioni.find((az) => az.id === assetSelezionato)?.variazione || 0) >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {azioni.find((az) => az.id === assetSelezionato)?.variazione.toFixed(2) || "N/A"}%
                        </span>
                      </p>

                      {/* Mostra l'alert se visibile */}
                      {mostraAlert && (
                        <Alert variant={alertMessaggio.includes("🚨") ? "danger" : "success"} className="mt-3">
                          {alertMessaggio}
                        </Alert>
                      )}
                    </>
                  ) : (
                    <p>Seleziona un asset per visualizzare le statistiche.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Sezione Notizie Finanziarie */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="dashboard-card">
                <Card.Body>
                  <h2 className="text-center mx-4"> Ultimi Aggiornamenti</h2>
                  {/* <FinancialNews />*/}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

Dashboard.propTypes = {
  utenteLoggato: PropTypes.shape({
    nome: PropTypes.string,
    id: PropTypes.number,
  }),
};

export default Dashboard;
