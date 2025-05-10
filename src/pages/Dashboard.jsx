import { useState, useEffect, useCallback } from "react";
import { Card, Col, Container, Row, Spinner, Form, Alert } from "react-bootstrap";
import GraficoAzioni from "../components/GraficoAzioni";
// import FinancialNews from "./FinancialNews";
import { FaBell, FaSync } from "react-icons/fa";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { fetchAzioni, fetchAlert } from "../service/apiService";

const Dashboard = ({ utenteLoggato }) => {
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [azioni, setAzioni] = useState([]);
  const [assetSelezionato, setAssetSelezionato] = useState(null);
  const [alertMessaggio, setAlertMessaggio] = useState("");
  const [mostraAlert, setMostraAlert] = useState(false);
  const [erroreCaricamento, setErroreCaricamento] = useState(null);

  const navigate = useNavigate();

  const handleAuthError = useCallback(() => {
    console.error("Errore di autenticazione/autorizzazione.");
    sessionStorage.removeItem("jwtToken");
    navigate("/");
    alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
  }, [navigate]);

  const loadDati = useCallback(async () => {
    setIsUpdating(true);
    setErroreCaricamento(null);
    try {
      const azioniData = await fetchAzioni();
      setAzioni(azioniData);
      if (azioniData.length > 0 && assetSelezionato === null) {
        setAssetSelezionato(azioniData[0].id);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
      if (
        error.message === "Token JWT non trovato." ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        handleAuthError();
      } else {
        setErroreCaricamento("Errore nel caricamento dei dati. Riprova più tardi.");
      }
    } finally {
      setIsUpdating(false);
      setLoading(false);
    }
  }, [assetSelezionato, handleAuthError]);

  const loadAlert = useCallback(
    async (assetId) => {
      try {
        const alertData = await fetchAlert(assetId);
        setAlertMessaggio(alertData.includes("INFO:") ? alertData : " Nessuna variazione significativa.");
      } catch (error) {
        console.error("Errore nel recupero dell'alert:", error);
        if (
          error.message === "Token JWT non trovato." ||
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          handleAuthError();
        } else {
          setAlertMessaggio(` Errore nel recupero dell'alert: ${error.message}`);
        }
      }
    },
    [handleAuthError]
  );

  useEffect(() => {
    loadDati();
    const interval = setInterval(loadDati, 180000);
    return () => clearInterval(interval);
  }, [loadDati]);

  useEffect(() => {
    if (assetSelezionato !== null) {
      loadAlert(assetSelezionato);
    }
  }, [assetSelezionato, loadAlert]);

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
      ) : erroreCaricamento ? (
        <Alert variant="danger" className="mt-3">
          {erroreCaricamento}
        </Alert>
      ) : (
        <>
          {isUpdating && (
            <div className="text-center mb-2">
              <FaSync className="fa-spin" style={{ fontSize: "1.5em", color: "#6ee7b7" }} /> Aggiornamento...
            </div>
          )}

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
                      style={{ cursor: "pointer", marginLeft: "10px", color: "#ffdb58" }}
                      onClick={handleBellClick}
                    />
                  </Card.Title>

                  {azioni.length > 0 && assetSelezionato !== null ? (
                    <>
                      <p>
                        <strong>Ultimo Prezzo:</strong>{" "}
                        <span className="text-white">
                          €{azioni.find((az) => az.id === assetSelezionato)?.valoreAttuale.toFixed(2) || "N/A"}
                        </span>
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

                      {mostraAlert && (
                        <Alert variant={alertMessaggio.includes("INFO:") ? "danger" : "success"} className="mt-3">
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

          <Row className="mt-5">
            <Col md={12}>
              <Card className="dashboard-card">
                <Card.Body>
                  <h2 className="text-center mx-4"> Ultimi Aggiornamenti</h2>
                  {/* <FinancialNews /> */}
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
