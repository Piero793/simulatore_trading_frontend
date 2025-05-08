import { useState } from "react";
import PropTypes from "prop-types";
import { Container, Row, Col } from "react-bootstrap";
import LoginForm from "../service/LoginForm";
import RegistrationForm from "../service/RegistrationForm";

const Home = ({ setAutenticato, setUtenteLoggato }) => {
  const [mostraRegistrazione, setMostraRegistrazione] = useState(false);

  return (
    <Container className="text-center my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h1 className="fw-bold mb-4">Benvenuto in SimuTrade X</h1>
          <p className="text-secondary">Accedi alla tua Dashboard per monitorare il mercato e simulare investimenti.</p>

          {!mostraRegistrazione ? (
            <LoginForm setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />
          ) : (
            <RegistrationForm setAutenticato={setAutenticato} setUtenteLoggato={setUtenteLoggato} />
          )}

          <p className="mt-3">
            {!mostraRegistrazione ? (
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostraRegistrazione(true)}>
                Registrati
              </button>
            ) : (
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setMostraRegistrazione(false)}>
                Torna al Login
              </button>
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
