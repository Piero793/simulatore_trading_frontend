import { Card, Col, Container, Row, Spinner, Form, Alert } from "react-bootstrap";
import GraficoAzioni from "../components/GraficoAzioni";
import { useState, useEffect, useCallback } from "react";
import { FaBell } from "react-icons/fa";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [azioni, setAzioni] = useState([]);
  const [transazioni, setTransazioni] = useState([]);
  const [assetSelezionato, setAssetSelezionato] = useState(null);
  const [alertMessaggio, setAlertMessaggio] = useState("");
  const [mostraAlert, setMostraAlert] = useState(false);

  const fetchDati = useCallback(async () => {
    try {
      console.log("DEBUG - Fetching dati...");

      const azioniRes = await fetch("http://localhost:8080/api/azioni");
      if (!azioniRes.ok) throw new Error(`Errore API Azioni: ${azioniRes.status} - ${azioniRes.statusText}`);

      const transazioniRes = await fetch("http://localhost:8080/api/transazioni");
      if (!transazioniRes.ok)
        throw new Error(`Errore API Transazioni: ${transazioniRes.status} - ${transazioniRes.statusText}`);

      const azioniData = await azioniRes.json();
      const transazioniData = await transazioniRes.json();

      console.log("DEBUG - Azioni ricevute:", azioniData);
      console.log("DEBUG - Transazioni ricevute:", transazioniData);

      setAzioni(azioniData);
      setTransazioni(transazioniData);

      // Se non ci sono transazioni iniziali, forziamo un assetSelezionato
      if (azioniData.length > 0 && !assetSelezionato) {
        setAssetSelezionato(azioniData[0].id);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
    } finally {
      setLoading(false);
    }
  }, [assetSelezionato]);

  useEffect(() => {
    fetchDati();
    const interval = setInterval(() => {
      fetchDati();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchDati]);

  useEffect(() => {
    if (assetSelezionato) {
      fetchAlert(assetSelezionato);
    }
  }, [assetSelezionato]);

  const fetchAlert = async (assetId) => {
    try {
      console.log(`DEBUG - Richiesta alert per asset ID: ${assetId}`);

      const response = await fetch(`http://localhost:8080/api/previsione/alert/${assetId}`);

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
  };

  return (
    <Container className="dashboard-container">
      <h2 className="text-center my-4">📊 Analisi del Mercato</h2>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <p>Caricamento dati...</p>
        </div>
      ) : (
        <>
          <Row>
            <Col md={12} className="mb-3 text-center">
              <Form.Select value={assetSelezionato} onChange={(e) => setAssetSelezionato(Number(e.target.value))}>
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
                  <Card.Title>📈 Andamento del Prezzo delle Azioni</Card.Title>
                  {azioni.length > 0 ? (
                    <GraficoAzioni data={azioni} transazioni={transazioni} assetId={assetSelezionato} />
                  ) : (
                    <p>Nessun dato disponibile.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>
                    📌 Statistiche{" "}
                    <FaBell
                      style={{ cursor: "pointer", marginLeft: "10px", color: "#ff9800" }}
                      onClick={() => setMostraAlert(!mostraAlert)}
                    />
                  </Card.Title>

                  {azioni.length > 0 ? (
                    <>
                      <p>
                        <strong>Ultimo Prezzo:</strong> €
                        {azioni.find((az) => az.id === assetSelezionato)?.valoreAttuale.toFixed(2) || "N/A"}
                      </p>
                      <p>
                        <strong>Variazione Giornaliera:</strong>
                        <span
                          className={
                            azioni.find((az) => az.id === assetSelezionato)?.variazione >= 0
                              ? "text-success"
                              : "text-danger"
                          }
                        >
                          {azioni.find((az) => az.id === assetSelezionato)?.variazione.toFixed(2) || "N/A"}%
                        </span>
                      </p>

                      {/* 🔥 Mostriamo l'alert SOLO quando l'utente clicca sulla campanella */}
                      {mostraAlert && (
                        <Alert variant={alertMessaggio.includes("🚨") ? "danger" : "success"} className="mt-3">
                          {alertMessaggio}
                        </Alert>
                      )}
                    </>
                  ) : (
                    <p>Nessuna statistica disponibile.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            ;
          </Row>

          <Row>
            <Col md={12} className="mb-4">
              <Card className="dashboard-card">
                <Card.Body>
                  <Card.Title>📜 Cronologia Transazioni</Card.Title>
                  {transazioni.length > 0 ? (
                    <ul>
                      {transazioni.map((transazione) => (
                        <li key={transazione.id}>
                          <strong>{transazione.tipoTransazione}:</strong> {transazione.quantita}x{" "}
                          <strong>{transazione.nomeAzione}</strong> per un totale di €
                          {(transazione.quantita * transazione.prezzoUnitario).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nessuna transazione registrata.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
