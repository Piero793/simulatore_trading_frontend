import { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { register, login } from "./apiService";

const RegistrationForm = ({ setAutenticato, setUtenteLoggato }) => {
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", password: "" });
  const [alertInfo, setAlertInfo] = useState(null);
  const navigate = useNavigate();

  const handleChange = ({ target }) => setFormData({ ...formData, [target.name]: target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    try {
      const userData = await register(formData);
      setAlertInfo({ message: `Registrazione completata, benvenuto ${userData.nome}!`, variant: "success" });

      // **Login automatico dopo la registrazione**
      const loginData = await login(formData.email, formData.password);
      setAutenticato(true);
      setUtenteLoggato({
        nome: loginData.utente.nome,
        id: loginData.utente.id,
        portfolioId: loginData.utente.portfolioId,
      });

      sessionStorage.setItem("jwtToken", loginData.token);

      // **Navigazione automatica alla dashboard**
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      setAlertInfo({ message: error.message || "Errore durante la registrazione.", variant: "danger" });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {alertInfo && <Alert variant={alertInfo.variant}>{alertInfo.message}</Alert>}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Cognome"
          name="cognome"
          value={formData.cognome}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button variant="success" className="custom-button success w-100 ms-auto" type="submit">
        Completa Registrazione
      </Button>
    </Form>
  );
};

RegistrationForm.propTypes = {
  setAutenticato: PropTypes.func.isRequired,
  setUtenteLoggato: PropTypes.func.isRequired,
};

export default RegistrationForm;
