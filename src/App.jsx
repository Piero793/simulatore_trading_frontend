import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Home from "./components/Home";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Simulazione from "./pages/Simulazione";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Footer from "./components/Footer";

const App = () => {
  const [autenticato, setAutenticato] = useState(!!sessionStorage.getItem("jwtToken"));
  const [aggiornaPortfolio, setAggiornaPortfolio] = useState(0);
  const [utenteLoggato, setUtenteLoggato] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("jwtToken");
    setAutenticato(!!token);
    setUtenteLoggato(token ? utenteLoggato : null);
  }, [utenteLoggato]);

  const handleLogout = () => {
    sessionStorage.removeItem("jwtToken");
    setAutenticato(false);
    setUtenteLoggato(null);
  };

  return (
    <Router>
      <div className="app-container">
        <CustomNavbar autenticato={autenticato} utente={utenteLoggato?.nome} handleLogout={handleLogout} />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            )}
          </Routes>
        </div>
        <Footer autenticato={autenticato} />
      </div>
    </Router>
  );
};

App.propTypes = {
  setAutenticato: PropTypes.func,
  setUtenteLoggato: PropTypes.func,
};

export default App;
