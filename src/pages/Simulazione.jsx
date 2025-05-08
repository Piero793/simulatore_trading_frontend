import { Container, Form, Button, Alert, Row, Col, Modal } from "react-bootstrap";
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  fetchAzioni as fetchAzioniApi,
  fetchSaldo as fetchSaldoApi,
  creaTransazione as creaTransazioneApi,
} from "../service/apiService";

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

  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      sessionStorage.removeItem("jwtToken");
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
      navigate("/");
    },
    [navigate]
  );

  const fetchSaldo = useCallback(async () => {
    try {
      const data = await fetchSaldoApi();
      setSaldo(data.saldo);
    } catch (error) {
      console.error("Errore durante la comunicazione per il saldo:", error);
      if (error.message === "Token JWT non trovato.") {
        handleAuthError(401);
      } else {
        setMessaggio(`⚠️ Errore nel recupero del saldo: ${error.message}`);
      }
    }
  }, [handleAuthError]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const azioniData = await fetchAzioniApi();
        setAzioni(azioniData);
        await fetchSaldo();
      } catch (error) {
        console.error("Errore recupero dati:", error);
        if (error.message === "Token JWT non trovato.") {
          handleAuthError(401);
        } else {
          setMessaggio(`⚠️ Errore nel caricamento dei dati: ${error.message}`);
        }
      }
    };

    fetchData();
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

    const transazione = {
      tipoTransazione,
      quantita,
      prezzoUnitario: azioneSelezionata.valoreAttuale,
      azioneId: azioneSelezionata.id,
      portfolioId: utenteLoggato.portfolioId,
    };

    try {
      await creaTransazioneApi(transazione);
      setMessaggio(
        `✅ ${tipoTransazione} ${quantita} azioni di ${azioneSelezionata.nome} per €${(
          quantita * azioneSelezionata.valoreAttuale
        ).toFixed(2)}`
      );
      triggerPortfolioUpdate();
      setShowModal(false);
      await fetchSaldo();
      navigate("/portfolio");
    } catch (error) {
      console.error("Errore durante la comunicazione per la transazione:", error);
      if (error.message === "Token JWT non trovato.") {
        handleAuthError(401);
      } else if (error.message.startsWith("Errore HTTP")) {
        setMessaggio(`🚫 Errore nella transazione: ${error.message.split(" - ")[1]}`);
      } else {
        setMessaggio(`⚠️ Errore di comunicazione con il server: ${error.message}`);
      }
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
