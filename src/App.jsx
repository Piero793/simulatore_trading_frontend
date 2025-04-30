import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Simulazione from "./pages/Simulazione";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Footer from "./components/Footer";
import { useState, useEffect } from "react";

const App = () => {
  const [autenticato, setAutenticato] = useState(!!localStorage.getItem("jwtToken"));
  const [aggiornaPortfolio, setAggiornaPortfolio] = useState(0);
  const [utenteLoggato, setUtenteLoggato] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // In un'applicazione reale, dovrei anche validare il token (es. controllare scadenza)
      // Per semplicità, per ora assumo che la presenza del token significhi autenticato.
      setAutenticato(true);
    } else {
      setAutenticato(false);
      setUtenteLoggato(null); // Resetta l'utente loggato se non c'è token
    }
  }, []);

  // Funzione per gestire il logout
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    // Rimuovo anche i dettagli dell'utente se li ho salvati
    // localStorage.removeItem("utenteLoggato");
    setAutenticato(false);
    setUtenteLoggato(null);
  };

  return (
    <Router>
      <div className="app-container">
        <CustomNavbar
          autenticato={autenticato}
          setAutenticato={setAutenticato}
          utente={utenteLoggato?.nome}
          handleLogout={handleLogout}
        />
        <div className="content-container">
          <Routes>
            {/* La Home è accessibile a tutti */}
            <Route path="/" element={<Home setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />} />

            {/* Rotte protette: accessibili solo se autenticato */}
            {autenticato ? (
              <>
                <Route path="/dashboard" element={<Dashboard utenteLoggato={utenteLoggato} />} />
                <Route
                  path="/portfolio"
                  element={<Portfolio aggiornaPortfolio={aggiornaPortfolio} utenteLoggato={utenteLoggato} />}
                />
                <Route
                  path="/simulazione"
                  element={<Simulazione setAggiornaPortfolio={setAggiornaPortfolio} utenteLoggato={utenteLoggato} />}
                />
              </>
            ) : (
              // Se non autenticato, reindirizza qualsiasi tentativo di accedere a rotte protette alla Home/Login
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </div>
        <Footer autenticato={autenticato} />
      </div>
    </Router>
  );
};

export default App;
