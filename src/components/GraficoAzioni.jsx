import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";
import { useState, useEffect, useMemo } from "react";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const GraficoAzioni = ({ data, transazioni, assetId }) => {
  const [intervallo, setIntervallo] = useState("1M");
  const [datiValidi, setDatiValidi] = useState([]);
  const [transazioniValidi, setTransazioniValidi] = useState([]);
  const [previsione, setPrevisione] = useState(null);

  useEffect(() => {
    setDatiValidi(Array.isArray(data) ? [...data] : []);
    setTransazioniValidi(Array.isArray(transazioni) ? [...transazioni] : []);

    //  Recupero la previsione per l'asset selezionato
    if (assetId) {
      fetch(`http://localhost:8080/api/previsione/${assetId}`)
        .then((response) => response.json())
        .then((data) => setPrevisione(data))
        .catch((error) => console.error("Errore nel recupero della previsione:", error));
    }
  }, [data, transazioni, assetId]);

  const datiFiltrati = useMemo(() => {
    return datiValidi.length > 0
      ? datiValidi.slice(
          intervallo === "1G"
            ? -1
            : intervallo === "1S"
            ? -7
            : intervallo === "1M"
            ? -30
            : intervallo === "1A"
            ? -365
            : -datiValidi.length
        )
      : [];
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
            label: "🔮 Previsione Prezzo (€)",
            data: [datiFiltrati[datiFiltrati.length - 1]?.valoreAttuale, previsione],
            borderColor: "#ff9800",
            borderDash: [5, 5], // Linea tratteggiata per la previsione (richiama il modello ml in spring)
            tension: 0.5,
            pointRadius: 6,
            showLine: true,
          },
        ]
      : [];
  }, [previsione, datiFiltrati]);

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
        ...previsioneDataset, // Aggiungo la previsione al grafico!
        {
          label: "🔹 Transazioni (Acquisto/Vendita)",
          data: transazioniDataset,
          pointStyle: "circle",
          showLine: false,
        },
      ],
    }),
    [datiFiltrati, transazioniDataset, previsioneDataset]
  );

  const chartOptions = {
    plugins: {
      zoom: {
        zoom: {
          wheel: { enabled: true },
          drag: { enabled: true },
          mode: "x",
        },
        pan: { enabled: true, mode: "x" },
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
      x: {
        title: { display: true, text: "📌 Indici dati" },
      },
      y: {
        title: { display: true, text: "💰 Prezzo (€)" },
        beginAtZero: false,
      },
    },
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
      {datiValidi.length > 0 ? (
        <Line key={JSON.stringify(chartData)} data={chartData} options={chartOptions} />
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
  ),
  transazioni: PropTypes.arrayOf(
    PropTypes.shape({
      prezzoUnitario: PropTypes.number.isRequired,
      tipoTransazione: PropTypes.string.isRequired,
    })
  ),
  assetId: PropTypes.number, //  Ora il componente accetta l'ID dell'asset per la previsione!
};

export default GraficoAzioni;
