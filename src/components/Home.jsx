import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Home = ({ setAutenticato, setUtenteLoggato }) => {
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [errore, setErrore] = useState(null);
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false); // Gestisce la visibilità del form di registrazione
  const navigate = useNavigate(); // Chiamo la funzione navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    console.log("Inizio tentativo di login con:", { email: formData.username, password: formData.password });
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.username, password: formData.password }), // ⚠️ Backend si aspetta 'email'
      });

      console.log("Risposta dal backend (login):", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Login riuscito. Dati utente:", data);
        setAutenticato(true);
        setUtenteLoggato({ nome: data.nome, id: data.id /* ... altre info utente se presenti ... */ }); //  il backend deve restituire 'nome'
        navigate("/dashboard");
        setErrore(null);
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

  const handleRegistration = async () => {
    console.log("Inizio tentativo di registrazione con:", formData);
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.username, //  Assumendo che 'username' sia il nome
          cognome: "defaultCognome", //  Dovrei aggiungere un campo cognome nel form se necessario
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log("Risposta dal backend (registrazione):", response);

      if (response.status === 201) {
        const data = await response.json();
        console.log("Registrazione riuscita. Dati utente:", data);
        setAutenticato(true);
        setUtenteLoggato({ nome: data.nome, id: data.id /* ... altre info utente se presenti ... */ });
        navigate("/dashboard");
        setErrore(null);
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

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4"> Benvenuto nel Simulatore di Trading</h1>
          <p className="text-secondary">Accedi alla tua Dashboard per monitorare il mercato e simulare investimenti.</p>

          {errore && <Alert variant="danger">{errore}</Alert>}

          {!mostraRegistrazione ? (
            <>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Email" // Backend si aspetta 'email' per il login
                    name="username" // Manteniamo 'username' ma inviamo come 'email'
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" className="w-100" onClick={handleLogin}>
                  🔑 Login
                </Button>
              </Form>

              <p className="mt-3">
                Sei nuovo?{" "}
                <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(true)}>
                  ✍️ Registrati
                </Button>
              </p>
            </>
          ) : (
            <>
              <Form onSubmit={handleSubmitRegistration}>
                {" "}
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Nome"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button variant="success" className="w-100" type="submit">
                  {" "}
                  {/*  Cambiato onClick a onSubmit e aggiunto type="submit" */}✅ Completa Registrazione
                </Button>
              </Form>

              <p className="mt-3">
                Hai già un account?{" "}
                <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(false)}>
                  🔙 Torna al Login
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
  setUtenteLoggato: PropTypes.func.isRequired, //  Ricevo anche il setter per l'utente
};

export default Home;
