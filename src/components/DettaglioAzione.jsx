import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";

const DettaglioAzione = ({ show, handleClose, azione }) => {
  if (!azione) return null;

  const chartData = {
    labels: ["1G", "1S", "1M", "6M", "1A"],
    datasets: [
      {
        label: "Prezzo (€)",
        data: [
          azione.valoreAttuale - 5,
          azione.valoreAttuale - 3,
          azione.valoreAttuale,
          azione.valoreAttuale + 2,
          azione.valoreAttuale + 5,
        ],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
      },
    ],
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{azione.nome}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Valore Attuale:</strong> €{azione.valoreAttuale.toFixed(2)}
        </p>
        <p className={azione.variazione >= 0 ? "text-success" : "text-danger"}>
          <strong>Variazione:</strong> {azione.variazione.toFixed(2)}%
        </p>
        <div style={{ width: "100%", height: "200px" }}>
          <Line data={chartData} />
        </div>
        <p>{azione.descrizione || "Nessuna descrizione disponibile."}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Validazione delle props
DettaglioAzione.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  azione: PropTypes.shape({
    nome: PropTypes.string.isRequired,
    valoreAttuale: PropTypes.number.isRequired,
    variazione: PropTypes.number.isRequired,
    descrizione: PropTypes.string,
  }),
};

export default DettaglioAzione;
