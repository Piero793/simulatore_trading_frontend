import { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { login } from "./authService";

const LoginForm = ({ setAutenticato, setUtenteLoggato }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [alertInfo, setAlertInfo] = useState(null);
  const navigate = useNavigate();

  const handleChange = ({ target }) => setFormData({ ...formData, [target.name]: target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    try {
      const data = await login(formData.email, formData.password);
      setAutenticato(true);
      setUtenteLoggato({ nome: data.utente.nome, id: data.utente.id, portfolioId: data.utente.portfolioId });

      sessionStorage.setItem("jwtToken", data.token);
      setAlertInfo({ message: `Benvenuto, ${data.utente.nome}!`, variant: "success" });

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      setAlertInfo({ message: error.message, variant: "danger" });
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {alertInfo && <Alert variant={alertInfo.variant}>{alertInfo.message}</Alert>}
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
      <Button variant="primary" className="w-100" type="submit">
        Login
      </Button>
    </Form>
  );
};

LoginForm.propTypes = {
  setAutenticato: PropTypes.func.isRequired,
  setUtenteLoggato: PropTypes.func.isRequired,
};

export default LoginForm;
