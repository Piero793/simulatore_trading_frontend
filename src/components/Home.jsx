import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col, Button } from "react-bootstrap";
import LoginForm from "../service/LoginForm";
import RegistrationForm from "../service/RegistrationForm";

const Home = ({ setAutenticato, setUtenteLoggato }) => {
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false);

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4 text-white">Benvenuto in SimuTrade X</h1>
          <p className="lead text-gray-300 mb-5">
            La tua porta d&apos; accesso al mondo del trading simulato.
            <br />
            Acquisisci esperienza, affina le tue strategie e preparati al successo nel mercato reale.
          </p>
          {!mostraRegistrazione ? (
            <LoginForm setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />
          ) : (
            <RegistrationForm setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />
          )}

          <p className="mt-3">
            {!mostraRegistrazione ? (
              <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(true)}>
                Registrati
              </Button>
            ) : (
              <Button variant="outline-secondary" size="sm" onClick={() => setMostraRegistrazione(false)}>
                Torna al Login
              </Button>
            )}
          </p>
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
