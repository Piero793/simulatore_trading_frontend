import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Simulazione = ({ setAggiornaPortfolio }) => {
  console.log("DEBUG - Prop ricevuta in Simulazione:", setAggiornaPortfolio);

  const [azioni, setAzioni] = useState([]);
  const [azioneSelezionata, setAzioneSelezionata] = useState(null);
  const [quantita, setQuantita] = useState(1);
  const [saldo, setSaldo] = useState(() => {
    return localStorage.getItem("saldo") ? parseFloat(localStorage.getItem("saldo")) : 10000;
  });
  const [messaggio, setMessaggio] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/azioni")
      .then((response) => response.json())
      .then((data) => setAzioni(data))
      .catch((error) => console.error("Errore nel recupero delle azioni:", error));
  }, []);

  const aggiornaSaldo = (nuovoSaldo) => {
    setSaldo(parseFloat(nuovoSaldo.toFixed(2))); // Aggiorna il saldo in React
    localStorage.setItem("saldo", nuovoSaldo.toFixed(2)); //  Mantiene il valore nel localStorage
  };

  const aggiornaPortfolio = () => {
    if (typeof setAggiornaPortfolio === "function") {
      setAggiornaPortfolio((prev) => prev + 1);
    } else {
      console.error("Errore: setAggiornaPortfolio non è una funzione!");
    }
  };

  const handleTransazione = async (tipoTransazione) => {
    if (!azioneSelezionata) {
      setMessaggio("⚠️ Seleziona un'azione!");
      return;
    }

    const valoreTotale = quantita * azioneSelezionata.valoreAttuale;

    //  Verifico il saldo per acquisto
    if (tipoTransazione === "Acquisto" && valoreTotale > saldo) {
      setMessaggio("🚫 Saldo insufficiente!");
      return;
    }

    //  Verifica azioni disponibili per vendita
    if (tipoTransazione === "Vendita" && quantita > azioneSelezionata.quantita) {
      setMessaggio(`🚫 Non puoi vendere più di ${azioneSelezionata.quantita} azioni!`);
      return;
    }

    const nuovoSaldo = tipoTransazione === "Acquisto" ? saldo - valoreTotale : saldo + valoreTotale;
    aggiornaSaldo(nuovoSaldo);

    setMessaggio(
      `✅ ${tipoTransazione} ${quantita} azioni di ${azioneSelezionata.nome} per €${valoreTotale.toFixed(2)}`
    );

    const transazione = {
      tipoTransazione,
      quantita,
      prezzoUnitario: azioneSelezionata.valoreAttuale,
      azioneId: azioneSelezionata.id,
      nomeUtente: "filippo", // andrà cambiato
    };

    await fetch("http://localhost:8080/api/transazioni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transazione),
    });

    aggiornaPortfolio();
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
            <Button variant="success" onClick={() => handleTransazione("Acquisto")} className="mx-2">
              Compra
            </Button>
            <Button variant="danger" onClick={() => handleTransazione("Vendita")} className="mx-2">
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
        </Col>
      </Row>
    </Container>
  );
};

Simulazione.propTypes = {
  setAggiornaPortfolio: PropTypes.func.isRequired,
};

export default Simulazione;
