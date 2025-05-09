import { Container, Row, Col } from "react-bootstrap";
import PropTypes from "prop-types";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = ({ autenticato }) => (
  <footer className="footer">
    <Container>
      <Row className="align-items-center">
        <Col md={4} className="text-center text-md-start">
          <p className="mb-0">© {new Date().getFullYear()} SimuTrade X. Tutti i diritti riservati.</p>
        </Col>

        {autenticato && (
          <Col md={4} className="text-center">
            <Link to="/dashboard" className="text-secondary mx-2 fw-bold hover:text-light">
              Dashboard
            </Link>
            <Link to="/portfolio" className="text-secondary mx-2 fw-bold hover:text-light">
              Portfolio
            </Link>
            <Link to="/simulazione" className="text-secondary mx-2 fw-bold hover:text-light">
              Simulazione
            </Link>
          </Col>
        )}

        <Col md={4} className="text-center text-md-end">
          <a href="https://facebook.com" className="text-white mx-2">
            <FaFacebook size={24} />
          </a>
          <a href="https://twitter.com" className="text-white mx-2">
            <FaTwitter size={24} />
          </a>
          <a href="https://instagram.com" className="text-white mx-2">
            <FaInstagram size={24} />
          </a>
          <a href="https://linkedin.com" className="text-white mx-2">
            <FaLinkedin size={24} />
          </a>
        </Col>
      </Row>
    </Container>
  </footer>
);

Footer.propTypes = {
  autenticato: PropTypes.bool.isRequired,
};

export default Footer;
