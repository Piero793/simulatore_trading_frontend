import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Home = ({ setAutenticato, setUtenteLoggato }) => {
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", password: "" });
  const [alertInfo, setAlertInfo] = useState({ message: null, variant: null });
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false);
  const navigate = useNavigate();

  const showAlert = (message, variant) => {
    setAlertInfo({ message, variant });
  };

  const hideAlert = () => {
    setAlertInfo({ message: null, variant: null });
  };

  const handleChange = ({ target }) => {
    setFormData({ ...formData, [target.name]: target.value });
  };

  const gestisciLoginSuccesso = (loginResponseData) => {
    const token = loginResponseData.token;
    sessionStorage.setItem("jwtToken", token);

    const utenteData = loginResponseData.utente;
    setAutenticato(true);
    setUtenteLoggato({
      nome: utenteData.nome,
      id: utenteData.id,
      portfolioId: utenteData.portfolioId,
    });

    showAlert(`Benvenuto, ${utenteData.nome}!`, "success");
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleLogin = async () => {
    hideAlert();

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        const data = await response.json();
        gestisciLoginSuccesso(data);
      } else {
        let errorData = response.statusText;
        try {
          const jsonError = await response.json();
          errorData = jsonError?.message || JSON.stringify(jsonError);
        } catch (e) {
          console.error("Errore nel parsing del corpo della risposta:", e);
          try {
            errorData = await response.text();
          } catch (textError) {
            console.error("Errore nel parsing del corpo della risposta:", textError);
          }
        }
        showAlert(
          response.status === 401 ? "Credenziali non valide." : `Errore durante il login: ${errorData}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      showAlert("Impossibile connettersi al server o errore di rete.", "danger");
    }
  };

  const gestisciRegistrazioneSuccesso = async (utenteData) => {
    showAlert(`Registrazione completata con successo, ${utenteData.nome}! Effettuo il login...`, "success");

    try {
      const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        gestisciLoginSuccesso(loginData);
      } else {
        let errorData = loginResponse.statusText;
        try {
          const jsonError = await loginResponse.json();
          errorData = jsonError?.message || JSON.stringify(jsonError);
        } catch (e) {
          console.error("Errore nel parsing del corpo della risposta:", e);
          try {
            errorData = await loginResponse.text();
          } catch (textError) {
            console.error("Errore nel parsing del corpo della risposta:", textError);
          }
        }
        showAlert(`Errore nel login automatico dopo registrazione: ${errorData}`, "danger");
      }
    } catch (error) {
      console.error("Errore nel login automatico dopo registrazione:", error);
      showAlert("Impossibile effettuare il login automatico dopo la registrazione.", "danger");
    }
  };

  const handleRegistration = async () => {
    hideAlert();

    try {
      const response = await fetch("http://localhost:8080/api/utenti/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.status === 201) {
        const data = await response.json();
        gestisciRegistrazioneSuccesso(data);
      } else {
        let errorData = response.statusText;
        try {
          const jsonError = await response.json();
          errorData = jsonError?.message || JSON.stringify(jsonError);
        } catch (e) {
          console.error(e);
          try {
            errorData = await response.text();
          } catch (textError) {
            console.error(textError);
          }
        }
        showAlert(`Errore durante la registrazione: ${errorData}`, "danger");
      }
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      showAlert("Impossibile connettersi al server o errore di rete.", "danger");
    }
  };

  const handleSubmitLogin = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    handleRegistration();
  };

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4">Benvenuto in SimuTrade X</h1>
          <p className="text-secondary">Accedi alla tua Dashboard per monitorare il mercato e simulare investimenti.</p>

          {alertInfo.message && (
            <Alert variant={alertInfo.variant} onClose={hideAlert} dismissible>
              {alertInfo.message}
            </Alert>
          )}

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
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setMostraRegistrazione(true);
                    hideAlert();
                  }}
                >
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
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setMostraRegistrazione(false);
                    hideAlert();
                  }}
                >
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
