import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/portfolio";
import Simulazione from "./pages/Simulazione";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Footer from "./components/Footer";
import { useState } from "react";

const App = () => {
  const [autenticato, setAutenticato] = useState(true); // Stato per gestire il login true finche non implemento autenticazione
  const [aggiornaPortfolio, setAggiornaPortfolio] = useState(0); // Stato per aggiornare il Portfolio

  return (
    <Router>
      <div className="app-container">
        {/* Navbar dinamica */}
        <CustomNavbar autenticato={autenticato} />

        {/* Contenuto delle pagine */}
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home setAutenticato={setAutenticato} />} />{" "}
            {/* 🔥 Ora la Home è la pagina principale */}
            {autenticato && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/portfolio"
                  element={<Portfolio nomeUtente="filippo" aggiornaPortfolio={aggiornaPortfolio} />}
                />
                <Route path="/simulazione" element={<Simulazione setAggiornaPortfolio={setAggiornaPortfolio} />} />
              </>
            )}
          </Routes>
        </div>

        {/* Footer dinamico */}
        <Footer autenticato={autenticato} />
      </div>
    </Router>
  );
};

export default App;
