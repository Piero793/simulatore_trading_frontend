import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomNavbar from "./components/CustomNavbar";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/portfolio";
import Simulazione from "./pages/Simulazione";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/App.css";
import Footer from "./components/Footer";
import { useState } from "react";

const App = () => {
  const [aggiornaPortfolio, setAggiornaPortfolio] = useState(0); // Stato per aggiornare Portfolio

  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <CustomNavbar />

        {/* Contenuto delle pagine */}
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/portfolio"
              element={<Portfolio nomeUtente="filippo" aggiornaPortfolio={aggiornaPortfolio} />} // nome utente filippo è provvisorio
            />
            <Route path="/simulazione" element={<Simulazione setAggiornaPortfolio={setAggiornaPortfolio} />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
