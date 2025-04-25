import { Container, Form, Button, Alert, Row, Col, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const Simulazione = ({ setAggiornaPortfolio, utenteLoggato }) => {
  console.log("DEBUG - Prop utenteLoggato ricevuta in Simulazione:", utenteLoggato);

  const [azioni, setAzioni] = useState([]); // Stato per la lista di azioni disponibili
  const [azioneSelezionata, setAzioneSelezionata] = useState(null); // Stato per l'azione scelta
  const [quantita, setQuantita] = useState(1); // Stato per la quantità da acquistare/vendere
  const [saldo, setSaldo] = useState(() => {
    return localStorage.getItem("saldo") ? parseFloat(localStorage.getItem("saldo")) : 10000;
  }); // Stato per il saldo utente, salvato in localStorage
  const [messaggio, setMessaggio] = useState(""); // Stato per i messaggi di feedback
  const [showModal, setShowModal] = useState(false); // Stato per mostrare/nascondere il modale di conferma
  const [countdown, setCountdown] = useState(60); // Stato per il timer del modale
  const [tipoTransazione, setTipoTransazione] = useState(""); // Stato per il tipo di operazione
  const navigate = useNavigate(); // Hook per la navigazione

  // Effetto per il recuperaro della lista di azioni dal backend
  useEffect(() => {
    fetch("http://localhost:8080/api/azioni")
      .then((response) => response.json())
      .then((data) => setAzioni(data))
      .catch((error) => console.error("Errore nel recupero delle azioni:", error));
  }, []);

  // Effetto per gestire il countdown e chiusura automatica del modale
  useEffect(() => {
    let timer;
    if (showModal) {
      setCountdown(60); // Reset del timer a 60 secondi
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      // Dopo 60 secondi, il modale si chiude automaticamente
      setTimeout(() => {
        setShowModal(false);
      }, 60000);
    }
    return () => clearInterval(timer); // Pulizia del timer quando il modale si chiude
  }, [showModal]);

  // Funzione per aggiornare il saldo utente
  const aggiornaSaldo = (nuovoSaldo) => {
    setSaldo(parseFloat(nuovoSaldo.toFixed(2))); // Aggiorna il saldo nello stato
    localStorage.setItem("saldo", nuovoSaldo.toFixed(2)); // Mantiene il valore nel localStorage
  };

  // Funzione per aggiornare il portfolio dell'utente
  const aggiornaPortfolio = () => {
    if (typeof setAggiornaPortfolio === "function") {
      setAggiornaPortfolio((prev) => prev + 1);
    } else {
      console.error("Errore: setAggiornaPortfolio non è una funzione!");
    }
  };

  // Funzione per avviare il processo di conferma dell'acquisto o vendita
  const avviaConferma = (tipo) => {
    if (!azioneSelezionata) {
      setMessaggio("⚠️ Seleziona un'azione!");
      return;
    }
    setTipoTransazione(tipo);
    setShowModal(true);
  };

  // Funzione per gestire la transazione finale
  const handleTransazione = async () => {
    if (!azioneSelezionata) {
      setMessaggio("⚠️ Seleziona un'azione!");
      return;
    }

    const valoreTotale = quantita * azioneSelezionata.valoreAttuale;

    const transazione = {
      tipoTransazione,
      quantita,
      prezzoUnitario: azioneSelezionata.valoreAttuale,
      azioneId: azioneSelezionata.id,
      nomeUtente: utenteLoggato?.nome, // ⚠️ Usa utenteLoggato?.nome
    };

    try {
      const response = await fetch("http://localhost:8080/api/transazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transazione),
      });

      if (response.ok) {
        // const responseData = await response.json(); // Potresti voler fare qualcosa con la risposta
        aggiornaSaldo(tipoTransazione === "Acquisto" ? saldo - valoreTotale : saldo + valoreTotale);
        setMessaggio(
          `✅ ${tipoTransazione} ${quantita} azioni di ${azioneSelezionata.nome} per €${valoreTotale.toFixed(2)}`
        );
        aggiornaPortfolio();
        setShowModal(false); // Chiude il modale dopo la conferma
        navigate("/portfolio"); // Reindirizza al Portfolio
      } else {
        // Gestisci gli errori dal backend
        const errorData = await response.text(); // O response.json() se il backend invia JSON per gli errori
        setMessaggio(`🚫 Errore nella transazione: ${errorData}`);
        setShowModal(false); // Chiude il modale anche in caso di errore
      }
    } catch (error) {
      console.error("Errore durante la comunicazione con il backend:", error);
      setMessaggio("⚠️ Errore di comunicazione con il server.");
      setShowModal(false);
    }
  };

  return (
    <Container className="simulazione-container">
      <h2 className="text-center my-4">💸 Simulazione Acquisto/Vendita</h2>

      <Row className="justify-content-center">
        <Col md={6}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>📈 Seleziona azione</Form.Label>
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
              <Form.Label>📦 Quantità</Form.Label>
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
            <Alert variant="info" className="mt-4">
              {messaggio}
            </Alert>
          )}
          <Alert variant="secondary" className="mt-2">
            💰 Saldo Virtuale: €{saldo.toFixed(2)}
          </Alert>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Conferma {tipoTransazione}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Hai scelto di {tipoTransazione.toLowerCase()} {quantita} azioni di {azioneSelezionata?.nome}
              al prezzo totale di €{(quantita * azioneSelezionata?.valoreAttuale).toFixed(2)}. Conferma entro
              {countdown} secondi.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annulla
              </Button>
              <Button variant="success" onClick={handleTransazione}>
                Conferma
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

Simulazione.propTypes = {
  setAggiornaPortfolio: PropTypes.func.isRequired,
  utenteLoggato: PropTypes.object, // ✅ Ricevi la prop utenteLoggato
};

export default Simulazione;
