import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const Home = ({ setAutenticato }) => {
  const [formData, setFormData] = useState({ username: "", password: "", email: "" });
  const [errore, setErrore] = useState(null);
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false); // 🔥 Gestisce la visibilità del form di registrazione

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    if (formData.username === "admin" && formData.password === "password") {
      setAutenticato(true);
      setErrore(null);
    } else {
      setErrore("❌ Credenziali errate. Riprova.");
    }
  };

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4"> Benvenuto nel Simulatore di Trading!</h1>
          <p className="text-secondary">Accedi alla tua Dashboard per monitorare il mercato e simulare investimenti.</p>

          {errore && <Alert variant="danger">{errore}</Alert>}

          {!mostraRegistrazione ? (
            <>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Username"
                    name="username"
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
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Username"
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

                <Button variant="success" className="w-100">
                  ✅ Completa Registrazione
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
};

export default Home;
