import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import zoomPlugin from "chartjs-plugin-zoom";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const getJwtToken = () => {
    return localStorage.getItem("jwtToken");
  };

  // Funzione per gestire gli errori di autenticazione/autorizzazione
  // Rimuove il token non valido e reindirizza al login.
  const handleAuthError = useCallback(
    (status) => {
      console.error(`Errore di autenticazione/autorizzazione: ${status}`);
      localStorage.removeItem("jwtToken"); // Rimuove il token
      navigate("/"); // Reindirizza alla pagina di login
      alert("La tua sessione è scaduta o non sei autorizzato. Effettua nuovamente il login.");
    },
    [navigate]
  );

  useEffect(() => {
    setDatiValidi(Array.isArray(data) ? [...data] : []);
    setTransazioniValidi(Array.isArray(transazioni) ? [...transazioni] : []);

    if (assetId) {
      const token = getJwtToken();
      if (!token) {
        handleAuthError(401);
        return;
      }

      fetch(`http://localhost:8080/api/previsione/${assetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          // Controllo lo stato della risposta per errori di autenticazione/autorizzazione
          if (response.status === 401 || response.status === 403) {
            handleAuthError(response.status);
            return null;
          }
          if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data !== null) {
            setPrevisione(data);
          }
        })
        .catch((error) => console.error("Errore nel recupero della previsione:", error));
    }
  }, [data, transazioni, assetId, handleAuthError]);

  const datiFiltrati = useMemo(() => {
    if (datiValidi.length === 0) return [];

    const mappingIntervalli = {
      "1G": 1,
      "1S": 7,
      "1M": 30,
      "1A": 365,
    };

    const numDati = mappingIntervalli[intervallo] || datiValidi.length;
    return datiValidi.slice(-Math.min(numDati, datiValidi.length));
  }, [intervallo, datiValidi]);

  const transazioniDataset = useMemo(() => {
    return transazioniValidi.map((transazione, index) => ({
      // L'indice 'x' potrebbe non corrispondere correttamente ai dati filtrati per intervallo.
      x: index,
      y: transazione.prezzoUnitario,
      backgroundColor: transazione.tipoTransazione === "Acquisto" ? "#28a745" : "#dc3545",
      borderColor: transazione.tipoTransazione === "Acquisto" ? "#28a745" : "#dc3545",
      radius: 6,
    }));
  }, [transazioniValidi]);

  const previsioneDataset = useMemo(() => {
    if (!previsione || datiFiltrati.length === 0) return [];

    // La previsione si collega all'ultimo punto dei dati filtrati
    return [
      {
        label: " Previsione Prezzo (€)",
        data: [
          { x: datiFiltrati.length - 1, y: datiFiltrati[datiFiltrati.length - 1]?.valoreAttuale }, // Ultimo punto dati
          { x: datiFiltrati.length, y: previsione }, // Punto previsione (un indice avanti)
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

    // Calcola i punti iniziale e finale per la trendline sui dati filtrati
    const startPoint = datiFiltrati[0];
    const endPoint = datiFiltrati[datiFiltrati.length - 1];

    return [
      {
        label: "📉 Trend Line (€)",
        data: [
          { x: 0, y: startPoint?.valoreAttuale }, // Primo punto dei dati filtrati
          { x: datiFiltrati.length - 1, y: endPoint?.valoreAttuale }, // Ultimo punto dei dati filtrati
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
      labels: datiFiltrati.map((_, index) => `Punto ${index + 1}`),
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
        // Aggiungo i dataset di previsione e trendline
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
            // Personalizzo la label del tooltip per mostrare il valore corretto
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
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "📌 Indici dati" },
      },
      y: { title: { display: true, text: "💰 Prezzo (€)" }, beginAtZero: false },
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
      <div className="text-center mb-3">
        {/* Bottoni per selezionare l'intervallo di tempo */}
        {["1G", "1S", "1M", "1A", "ALL"].map((tempo) => (
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
        {/* Bottoni per gestire zoom ed export */}
        <button className="btn btn-outline-secondary me-3" onClick={resetZoom}>
          Reset Zoom
        </button>
        <button className="btn btn-outline-success" onClick={exportChart}>
          <FaDownload /> Esporta Grafico
        </button>
      </div>

      {/* Renderizza il grafico solo se ci sono dati validi */}
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
