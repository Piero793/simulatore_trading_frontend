import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useRef } from "react";
import zoomPlugin from "chartjs-plugin-zoom";
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
import { FaDownload } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const GraficoAzioni = ({ data, transazioni, assetId }) => {
  const chartRef = useRef(null); // Gestione zoom/export
  const [intervallo, setIntervallo] = useState("1M");
  const [datiValidi, setDatiValidi] = useState([]);
  const [transazioniValidi, setTransazioniValidi] = useState([]);
  const [previsione, setPrevisione] = useState(null);

  useEffect(() => {
    setDatiValidi(Array.isArray(data) ? [...data] : []);
    setTransazioniValidi(Array.isArray(transazioni) ? [...transazioni] : []);

    if (assetId) {
      fetch(`http://localhost:8080/api/previsione/${assetId}`)
        .then((response) => response.json())
        .then((data) => setPrevisione(data))
        .catch((error) => console.error("Errore nel recupero della previsione:", error));
    }
  }, [data, transazioni, assetId]);

  const datiFiltrati = useMemo(() => {
    if (datiValidi.length === 0) return [];

    const mappingIntervalli = {
      "1G": 1,
      "1S": 7,
      "1M": 30,
      "1A": 365,
    };

    const numDati = mappingIntervalli[intervallo] || datiValidi.length;
    return datiValidi.slice(-Math.min(numDati, datiValidi.length)); // Gestisce intervalli
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
    return previsione
      ? [
          {
            label: " Previsione Prezzo (€)",
            data: [datiFiltrati[datiFiltrati.length - 1]?.valoreAttuale, previsione],
            borderColor: "#ff9800",
            borderDash: [5, 5],
            tension: 0.5,
            pointRadius: 6,
            showLine: true,
          },
        ]
      : [];
  }, [previsione, datiFiltrati]);

  const trendlineDataset = useMemo(() => {
    if (datiFiltrati.length < 2) return [];

    const start = datiFiltrati[0]?.valoreAttuale;
    const end = datiFiltrati[datiFiltrati.length - 1]?.valoreAttuale;

    return [
      {
        label: "📉 Trend Line (€)",
        data: [start, end],
        borderColor: "#17a2b8",
        borderDash: [3, 3],
        tension: 0.2,
        pointRadius: 0,
        showLine: true,
      },
    ];
  }, [datiFiltrati]);

  const chartData = useMemo(
    () => ({
      labels: [...datiFiltrati.map((_, index) => `Punto ${index + 1}`), "Prossima previsione"],
      datasets: [
        {
          label: "📈 Prezzo Azione (€)",
          data: datiFiltrati.map((item) => item.valoreAttuale),
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          tension: 0.5,
          pointRadius: 5,
          fill: false,
          showLine: true,
        },
        ...previsioneDataset,
        ...trendlineDataset,
        {
          label: " Transazioni (Acquisto/Vendita)",
          data: transazioniDataset,
          pointStyle: "circle",
          showLine: false,
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
            const valore = typeof tooltipItem.raw === "number" ? tooltipItem.raw.toFixed(2) : "N/A";
            return `💰 Prezzo: €${valore}`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: { title: { display: true, text: "📌 Indici dati" } },
      y: { title: { display: true, text: "💰 Prezzo (€)" }, beginAtZero: false },
    },
  };

  const resetZoom = () => {
    chartRef.current.resetZoom();
  };

  const exportChart = () => {
    const chart = chartRef.current;
    const link = document.createElement("a");
    link.href = chart.toBase64Image();
    link.download = `grafico_azioni_${assetId}.png`;
    link.click();
  };

  return (
    <div className="grafico-container">
      <div className="text-center mb-3">
        {["1G", "1S", "1M", "1A"].map((tempo) => (
          <button
            key={tempo}
            className={`btn mx-1 ${intervallo === tempo ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setIntervallo(tempo)}
          >
            {tempo}
          </button>
        ))}
      </div>

      <div className=" mb-3">
        <button className="btn btn-outline-secondary me-3" onClick={resetZoom}>
          Reset Zoom
        </button>
        <button className="btn btn-outline-success" onClick={exportChart}>
          <FaDownload /> Esporta Grafico
        </button>
      </div>

      {datiValidi.length > 0 ? (
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      ) : (
        <p className="text-center">⚠️ Nessun dato disponibile per il grafico.</p>
      )}
    </div>
  );
};
GraficoAzioni.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      valoreAttuale: PropTypes.number.isRequired,
    })
  ).isRequired,

  transazioni: PropTypes.arrayOf(
    PropTypes.shape({
      prezzoUnitario: PropTypes.number.isRequired,
      tipoTransazione: PropTypes.string.isRequired,
    })
  ).isRequired,

  assetId: PropTypes.number.isRequired,
};

export default GraficoAzioni;
