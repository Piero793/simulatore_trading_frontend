import { Container, Form, Button, Alert, Row, Col, Modal } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const Simulazione = ({ setAggiornaPortfolio, utenteLoggato }) => {
  const [azioni, setAzioni] = useState([]);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [quantita, setQuantita] = useState(1);
  const [saldo, setSaldo] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [tipoTransazione, setTipoTransazione] = useState("");
  const navigate = useNavigate();

  const getJwtToken = () => localStorage.getItem("jwtToken");

  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      localStorage.removeItem("jwtToken");
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
      navigate("/");
    },
    [navigate]
  );

  const fetchSaldo = useCallback(async () => {
    const token = getJwtToken();
    if (!token) return handleAuthError(401);
    if (!utenteLoggato?.nome) return;

    try {
      const response = await fetch(`http://localhost:8080/api/utenti/saldo/${utenteLoggato.nome}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) return handleAuthError(response.status);
      if (response.ok) {
        const data = await response.json();
        setSaldo(data.saldo);
      } else {
        setMessaggio("⚠️ Errore nel recupero del saldo.");
      }
    } catch (error) {
      console.error("Errore durante la comunicazione per il saldo:", error);
      setMessaggio("⚠️ Errore di comunicazione con il server per il saldo.");
    }
  }, [utenteLoggato?.nome, handleAuthError]);

  useEffect(() => {
    const token = getJwtToken();
    if (!token) return handleAuthError(401);

    const fetchAzioni = fetch("http://localhost:8080/api/azioni", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status === 401 || res.status === 403) return handleAuthError(res.status);
      if (!res.ok) throw new Error(`Errore API Azioni: ${res.status}`);
      return res.json();
    });

    Promise.all([fetchAzioni, fetchSaldo()])
      .then(([azioniData]) => azioniData && setAzioni(azioniData))
      .catch((err) => console.error("Errore recupero dati:", err));
  }, [fetchSaldo, handleAuthError]);

  useEffect(() => {
    let timer, timeout;
    if (showModal) {
      setCountdown(60);
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      timeout = setTimeout(() => {
        setShowModal(false);
        setMessaggio("Transazione annullata per timeout.");
      }, 60000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [showModal]);

  const triggerPortfolioUpdate = () => {
    if (typeof setAggiornaPortfolio === "function") {
      setAggiornaPortfolio((prev) => prev + 1);
    } else {
      console.error("Errore: setAggiornaPortfolio non è una funzione!");
    }
  };

  const avviaConferma = (tipo) => {
    if (!azioneSelezionata) return setMessaggio("⚠️ Seleziona un'azione!");
    const valoreTotale = quantita * azioneSelezionata.valoreAttuale;
    if (tipo === "Acquisto" && saldo !== null && valoreTotale > saldo) {
      return setMessaggio("🚫 Saldo insufficiente per l'acquisto!");
    }
    setTipoTransazione(tipo);
    setShowModal(true);
    setMessaggio("");
  };

  const handleTransazione = async () => {
    if (!azioneSelezionata || !utenteLoggato?.portfolioId) {
      setMessaggio("🚫 Errore: dati insufficienti per completare la transazione.");
      setShowModal(false);
      return;
    }

    const token = getJwtToken();
    if (!token) {
      handleAuthError(401);
      setShowModal(false);
      return;
    }

    const transazione = {
      tipoTransazione,
      quantita,
      prezzoUnitario: azioneSelezionata.valoreAttuale,
      azioneId: azioneSelezionata.id,
      portfolioId: utenteLoggato.portfolioId,
    };

    try {
      const response = await fetch("http://localhost:8080/api/transazioni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transazione),
      });

      if (response.status === 401 || response.status === 403) return handleAuthError(response.status);
      if (response.ok) {
        setMessaggio(
          `✅ ${tipoTransazione} ${quantita} azioni di ${azioneSelezionata.nome} per €${(
            quantita * azioneSelezionata.valoreAttuale
          ).toFixed(2)}`
        );
        triggerPortfolioUpdate();
        setShowModal(false);
        fetchSaldo();
        navigate("/portfolio");
      } else {
        const errorData = await response.text();
        setMessaggio(`🚫 Errore nella transazione: ${errorData}`);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Errore durante la comunicazione per la transazione:", error);
      setMessaggio("⚠️ Errore di comunicazione con il server.");
      setShowModal(false);
    }
  };

  return (
    <Container className="simulazione-container">
      <h2 className="text-center my-4">Simulazione Acquisto/Vendita</h2>

      <Row className="justify-content-center">
        <Col md={6}>
          <div className="mb-3 text-center">
            {saldo !== null ? (
              <p>
                Saldo virtuale disponibile: <strong>€{saldo.toFixed(2)}</strong>
              </p>
            ) : (
              <p>Caricamento saldo...</p>
            )}
          </div>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Seleziona azione</Form.Label>
              <Form.Select onChange={(e) => setAzioneSelezionata(azioni.find((a) => a.id === Number(e.target.value)))}>
                <option value="">Scegli azione...</option>
                {azioni.map((azione) => (
                  <option key={azione.id} value={azione.id}>
                    {azione.nome} (€{azione.valoreAttuale.toFixed(2)})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantità</Form.Label>
              <Form.Control
                type="number"
                value={quantita}
                min="1"
                onChange={(e) => setQuantita(Number(e.target.value))}
              />
            </Form.Group>
          </Form>

          <div className="text-center mt-3">
            <Button variant="success" onClick={() => avviaConferma("Acquisto")} className="mx-2">
              Compra
            </Button>
            <Button variant="danger" onClick={() => avviaConferma("Vendita")} className="mx-2">
              Vendi
            </Button>
          </div>

          {messaggio && (
            <Alert variant="info" className="mt-4 text-center">
              {messaggio}
            </Alert>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Conferma {tipoTransazione}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Confermi di voler {tipoTransazione.toLowerCase()} {quantita} azioni di{" "}
            <strong>{azioneSelezionata?.nome}</strong>?
          </p>
          <p>Prezzo totale: €{(quantita * (azioneSelezionata?.valoreAttuale || 0)).toFixed(2)}</p>
          <p className="text-muted">La conferma scadrà tra {countdown} secondi.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annulla
          </Button>
          <Button variant="primary" onClick={handleTransazione}>
            Conferma
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

Simulazione.propTypes = {
  setAggiornaPortfolio: PropTypes.func.isRequired,
  utenteLoggato: PropTypes.shape({
    nome: PropTypes.string,
    id: PropTypes.number,
    portfolioId: PropTypes.number,
  }),
};

export default Simulazione;
