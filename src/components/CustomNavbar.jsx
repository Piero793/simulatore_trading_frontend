import { Navbar, Nav, Container } from "react-bootstrap";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const CustomNavbar = ({ autenticato, setAutenticato, utente }) => (
  <Navbar bg="black" variant="dark" expand="lg" className="custom-navbar shadow-lg py-3">
    <Container>
      <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
        Simulatore Trading
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          {autenticato && (
            <>
              <Nav.Link as={Link} to="/dashboard" className="text-light">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/portfolio" className="text-light">
                Portfolio
              </Nav.Link>
              <Nav.Link as={Link} to="/simulazione" className="text-light">
                Simulazione
              </Nav.Link>
              <Nav.Link as={Link} to="/profilo" className="text-light fw-bold">
                Profilo
              </Nav.Link>
            </>
          )}
          <Nav>
            {autenticato ? (
              <Nav.Link as={Link} to="/" className="text-danger fw-bold" onClick={() => setAutenticato(false)}>
                Logout {utente && `(${utente})`}
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/" className="text-light">
                Login/Registrazione
              </Nav.Link>
            )}
          </Nav>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

// Validazione delle props
CustomNavbar.propTypes = {
  autenticato: PropTypes.bool.isRequired,
  setAutenticato: PropTypes.func.isRequired,
  utente: PropTypes.string,
};

export default CustomNavbar;
