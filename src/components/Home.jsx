import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Home = ({ setAutenticato, setUtenteLoggato }) => {
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", password: "" });
  const [errore, setErrore] = useState(null);
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false);
  const [mostraAlert, setMostraAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const gestisciLoginSuccesso = (data) => {
    console.log("Login riuscito. Dati utente:", data);
    setAutenticato(true);
    setUtenteLoggato({ nome: data.nome, id: data.id });
    setErrore(null);
    setAlertMessage(`Benvenuto, ${data.nome}!`);
    setMostraAlert(true);
    setTimeout(() => navigate("/dashboard"), 1500); // Naviga dopo 1.5 secondi
  };

  const handleLogin = async () => {
    console.log("Inizio tentativo di login con:", { email: formData.email, password: formData.password });
    try {
      const response = await fetch("http://localhost:8080/api/utenti/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      console.log("Risposta dal backend (login):", response);

      if (response.ok) {
        const data = await response.json();
        gestisciLoginSuccesso(data);
      } else {
        const errorData = await response.text();
        console.error("Errore durante il login:", response.status, errorData);
        setErrore(`❌ Errore durante il login: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Errore durante la chiamata al login:", error);
      setErrore("❌ Impossibile connettersi al server.");
    }
  };

  const gestisciRegistrazioneSuccesso = (data) => {
    console.log("Registrazione riuscita. Dati utente:", data);
    setAutenticato(true);
    setUtenteLoggato({ nome: data.nome, id: data.id });
    setErrore(null);
    setAlertMessage(`Registrazione completata con successo, ${data.nome}!`);
    setMostraAlert(true);
    setTimeout(() => navigate("/dashboard"), 1500); // Naviga dopo 1.5 secondi
  };

  const handleRegistration = async () => {
    console.log("Inizio tentativo di registrazione con:", formData);
    try {
      const response = await fetch("http://localhost:8080/api/utenti/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log("Risposta dal backend (registrazione):", response);

      if (response.status === 201) {
        const data = await response.json();
        gestisciRegistrazioneSuccesso(data);
      } else {
        const errorData = await response.json();
        console.error("Errore durante la registrazione:", response.status, errorData);
        setErrore(`❌ Errore durante la registrazione: ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Errore durante la chiamata alla registrazione:", error);
      setErrore("❌ Impossibile connettersi al server.");
    }
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    handleRegistration();
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4"> Benvenuto nel Simulatore di Trading</h1>
          <p className="text-secondary">Accedi alla tua Dashboard per monitorare il mercato e simulare investimenti.</p>

          {errore && <Alert variant="danger">{errore}</Alert>}
          {mostraAlert && <Alert variant="success">{alertMessage}</Alert>}

          {!mostraRegistrazione ? (
            <>
              <Form onSubmit={handleSubmitLogin}>
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

              <p className="mt-3">
                Sei nuovo?{" "}
                <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(true)}>
                  Registrati
                </Button>
              </p>
            </>
          ) : (
            <>
              <Form onSubmit={handleSubmitRegistration}>
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
                <Button variant="success" className="w-100" type="submit">
                  Completa Registrazione
                </Button>
              </Form>

              <p className="mt-3">
                Hai già un account?{" "}
                <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(false)}>
                  Torna al Login
                </Button>
              </p>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

Home.propTypes = {
  setAutenticato: PropTypes.func.isRequired,
  setUtenteLoggato: PropTypes.func.isRequired,
};

export default Home;
