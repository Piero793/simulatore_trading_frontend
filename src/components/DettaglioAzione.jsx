import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
        borderColor: "#6ee7b7",
        backgroundColor: "rgba(110, 231, 183, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        footerFont: { size: 10 },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: "#4a5568",
          borderDash: [2, 2],
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
  };

  return (
    <Modal show={show} onHide={handleClose} className="custom-modal">
      <Modal.Header closeButton className="custom-modal-header">
        <Modal.Title className="text-white">{azione.nome}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="custom-modal-body">
        <p className="text-white">
          <strong>Valore Attuale:</strong> €{azione.valoreAttuale.toFixed(2)}
        </p>
        <p className={azione.variazione >= 0 ? "text-success" : "text-danger"}>
          <strong>Variazione:</strong> {azione.variazione.toFixed(2)}%
        </p>
        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>
        <p className="text-white">{azione.descrizione || "Nessuna descrizione disponibile."}</p>
      </Modal.Body>
      <Modal.Footer className="custom-modal-footer">
        <Button variant="secondary" onClick={handleClose} className="custom-button">
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
