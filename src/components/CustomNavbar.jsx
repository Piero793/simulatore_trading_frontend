import { Navbar, Nav, Container } from "react-bootstrap";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const CustomNavbar = ({ autenticato, handleLogout, utente }) => (
  <Navbar bg="black" variant="dark" expand="lg" className="custom-navbar">
    <Container>
      <Navbar.Brand as={Link} to="/" className="navbar-brand">
        SimuTrade X
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          {autenticato && (
            <>
              <Nav.Link as={Link} to="/dashboard" className="nav-link">
                Dashboard
              </Nav.Link>
              <Nav.Link as={Link} to="/portfolio" className="nav-link">
                Portfolio
              </Nav.Link>
              <Nav.Link as={Link} to="/simulazione" className="nav-link">
                Simulazione
              </Nav.Link>
              {/* <Nav.Link as={Link} to="/profilo" className="nav-link active">
                Profilo
              </Nav.Link> */}
            </>
          )}
          <Nav>
            {autenticato ? (
              <Nav.Link className="nav-link text-danger fw-bold" onClick={handleLogout}>
                Logout {utente && `(${utente})`}
              </Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/" className="nav-link">
                {/* Login/Registrazione */}
              </Nav.Link>
            )}
          </Nav>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);
// propTypes
CustomNavbar.propTypes = {
  autenticato: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  utente: PropTypes.string,
};

export default CustomNavbar;
