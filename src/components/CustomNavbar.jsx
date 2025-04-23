import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const CustomNavbar = () => (
  <Navbar bg="black" variant="dark" expand="lg" className="custom-navbar shadow-lg py-3">
    <Container>
      <Navbar.Brand as={Link} to="/" className="fw-bold text-light">
        Simulatore Trading
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/" className="text-light">
            Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/portfolio" className="text-light">
            Portfolio
          </Nav.Link>
          <Nav.Link as={Link} to="/simulazione" className="text-light">
            Simulazione
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default CustomNavbar;
