import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-4 shadow">
      <Container>
        <Row className="align-items-center">
          {/* Copyright */}
          <Col md={4} className="text-center text-md-start">
            <p className="mb-0">© {new Date().getFullYear()} Simulatore Trading. Tutti i diritti riservati.</p>
          </Col>

          {/* Link di navigazione */}
          <Col md={4} className="text-center">
            <a href="/" className="text-white mx-2" style={{ textDecoration: "none" }}>
              Home
            </a>
            <a href="/portfolio" className="text-white mx-2" style={{ textDecoration: "none" }}>
              Portfolio
            </a>
            <a href="/simulazione" className="text-white mx-2" style={{ textDecoration: "none" }}>
              Simulazione
            </a>
          </Col>

          {/* Social Icons */}
          <Col md={4} className="text-center text-md-end">
            <a href="https://facebook.com" className="text-white mx-2" style={{ textDecoration: "none" }}>
              <FaFacebook size={24} />
            </a>
            <a href="https://twitter.com" className="text-white mx-2" style={{ textDecoration: "none" }}>
              <FaTwitter size={24} />
            </a>
            <a href="https://instagram.com" className="text-white mx-2" style={{ textDecoration: "none" }}>
              <FaInstagram size={24} />
            </a>
            <a href="https://linkedin.com" className="text-white mx-2" style={{ textDecoration: "none" }}>
              <FaLinkedin size={24} />
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
