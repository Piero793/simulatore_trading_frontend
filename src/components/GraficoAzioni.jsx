import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { Button } from "react-bootstrap";
import zoomPlugin from "chartjs-plugin-zoom";
import { useNavigate } from "react-router-dom";
import { fetchPrevisione } from "../service/apiService";

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
import { FaDownload, FaChartLine, FaUndo } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const GraficoAzioni = ({ transazioni, assetId }) => {
  const chartRef = useRef(null);
  const [intervallo, setIntervallo] = useState("1M");
  const [datiValidi, setDatiValidi] = useState([]);
  const [transazioniValidi, setTransazioniValidi] = useState([]);
  const [previsione, setPrevisione] = useState(null);
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
    setDatiValidi([]);
    setTransazioniValidi(Array.isArray(transazioni) ? [...transazioni] : []);

    const loadPrevisione = async () => {
      if (assetId) {
        try {
          const previsioneData = await fetchPrevisione(assetId);
          if (previsioneData) {
            setPrevisione(previsioneData);
            setDatiValidi(Array.isArray(previsioneData) ? [...previsioneData] : []);
          }
        } catch (error) {
          console.error("Errore nel recupero della previsione:", error);
          if (
            error.message === "Token JWT non trovato." ||
            error.message.includes("401") ||
            error.message.includes("403")
          ) {
            handleAuthError();
          }
        }
      }
    };

    loadPrevisione();
  }, [transazioni, assetId, handleAuthError]);

  const datiFiltrati = useMemo(() => {
    if (datiValidi.length === 0) return [];

    const mappingIntervalli = {
      "1G": 1,
      "1S": 7,
      "1M": 30,
      "1A": 365,
      ALL: datiValidi.length,
    };

    const numDati = mappingIntervalli[intervallo] || datiValidi.length;
    return datiValidi.slice(-Math.min(numDati, datiValidi.length));
  }, [intervallo, datiValidi]);

  const transazioniDataset = useMemo(() => {
    return transazioniValidi.map((transazione, index) => ({
      x: index,
      y: transazione.prezzoUnitario,
      backgroundColor: transazione.tipoTransazione === "Acquisto" ? "#28a745" : "#dc3545",
      borderColor: transazione.tipoTransazione === "Acquisto" ? "#28a745" : "#dc3545",
      radius: 6,
    }));
  }, [transazioniValidi]);

  const previsioneDataset = useMemo(() => {
    if (!previsione || datiFiltrati.length === 0) return [];

    const nextPrevisione =
      Array.isArray(previsione) && previsione.length > 0 ? previsione[previsione.length - 1]?.prezzoPrevisto : null;

    if (nextPrevisione === null) {
      return [];
    }

    return [
      {
        label: " Previsione Prezzo (€)",
        data: [
          { x: datiFiltrati.length - 1, y: datiFiltrati[datiFiltrati.length - 1]?.prezzoPrevisto },
          { x: datiFiltrati.length, y: nextPrevisione },
        ],
        borderColor: "#ff9800",
        borderDash: [5, 5],
        tension: 0.5,
        pointRadius: 6,
        showLine: true,
        fill: false,
      },
    ];
  }, [previsione, datiFiltrati]);

  const trendlineDataset = useMemo(() => {
    if (datiFiltrati.length < 2) return [];

    const startPoint = datiFiltrati[0];
    const endPoint = datiFiltrati[datiFiltrati.length - 1];

    return [
      {
        label: "📉 Trend Line (€)",
        data: [
          { x: 0, y: startPoint?.prezzoPrevisto },
          { x: datiFiltrati.length - 1, y: endPoint?.prezzoPrevisto },
        ],
        borderColor: "#17a2b8",
        borderDash: [3, 3],
        tension: 0.2,
        pointRadius: 0,
        showLine: true,
        fill: false,
      },
    ];
  }, [datiFiltrati]);

  const chartData = useMemo(
    () => ({
      labels: datiFiltrati.map((item) => `Giorno ${item.giorno}`),
      datasets: [
        {
          label: "📈 Prezzo Azione (€)",
          data: datiFiltrati.map((item) => item.prezzoPrevisto),
          borderColor: "#6ee7b7",
          backgroundColor: "rgba(110, 231, 183, 0.2)",
          tension: 0.4,
          pointRadius: 4,
          fill: true,
          showLine: true,
        },
        ...previsioneDataset,
        ...trendlineDataset,
        {
          label: " Transazioni (Acquisto/Vendita)",
          data: transazioniDataset,
          pointStyle: "circle",
          showLine: false,
          type: "scatter",
        },
      ],
    }),
    [datiFiltrati, transazioniDataset, previsioneDataset, trendlineDataset]
  );

  const chartOptions = {
    plugins: {
      zoom: {
        zoom: {
          wheel: { enabled: true },
          drag: { enabled: true },
          mode: "x",
          limits: { x: { min: "original", max: "original" } },
        },
        pan: {
          enabled: true,
          mode: "x",
        },
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: (tooltipItem) => {
            if (tooltipItem.dataset.label === " Transazioni (Acquisto/Vendita)") {
              return `${tooltipItem.dataset.label}: €${tooltipItem.raw.y.toFixed(2)}`;
            }
            const valore =
              typeof tooltipItem.raw === "number"
                ? tooltipItem.raw.toFixed(2)
                : typeof tooltipItem.raw?.y === "number"
                ? tooltipItem.raw.y.toFixed(2)
                : "N/A";
            return `${tooltipItem.dataset.label}: €${valore}`;
          },
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
        },
      },
      legend: {
        display: true,
        position: "bottom",
        labels: {
          font: {
            size: 12,
          },
          boxWidth: 12,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          font: {
            size: 14,
            weight: "bold",
          },
        },
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
        title: {
          display: true,
          text: " Prezzo (€)",
          font: {
            size: 14,
            weight: "bold",
          },
        },
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
    // Interactivity
    interaction: {
      mode: "nearest",
      intersect: false,
      axis: "x",
    },
  };

  const resetZoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  const exportChart = () => {
    const chart = chartRef.current;
    if (chart) {
      const link = document.createElement("a");
      link.href = chart.toBase64Image();
      link.download = `grafico_azioni_${assetId}.png`;
      link.click();
    }
  };

  return (
    <div className="grafico-container">
      <div className="d-flex justify-content-center mb-3">
        {["1G", "1S", "1M", "1A", "ALL"].map((tempo) => (
          <Button
            key={tempo}
            variant={intervallo === tempo ? "primary" : "outline-primary"}
            className="mx-2 btn-sm"
            onClick={() => setIntervallo(tempo)}
          >
            <FaChartLine className="me-1" />
            {tempo}
          </Button>
        ))}
      </div>

      <div className="d-flex justify-content-center mb-3">
        <Button variant="outline-secondary" className="me-3 btn-sm" onClick={resetZoom}>
          <FaUndo className="me-1" /> Reset Zoom
        </Button>
        <Button variant="outline-success" className="btn-sm" onClick={exportChart}>
          <FaDownload className="me-1" /> Esporta
        </Button>
      </div>

      {datiValidi.length > 0 ? (
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      ) : (
        <p className="text-center text-muted"> Nessun dato disponibile per il grafico.</p>
      )}
    </div>
  );
};

GraficoAzioni.propTypes = {
  transazioni: PropTypes.arrayOf(
    PropTypes.shape({
      prezzoUnitario: PropTypes.number.isRequired,
      tipoTransazione: PropTypes.string.isRequired,
    })
  ).isRequired,
  assetId: PropTypes.number.isRequired,
};

export default GraficoAzioni;
