import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

const CustomNavbar = () => (
  <Navbar bg="dark" variant="dark" expand="lg" className="custom-navbar">
    <Container>
      <Navbar.Brand as={Link} to="/" className="fw-bold">
        Simulatore Trading
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/">
            Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/portfolio">
            Portfolio
          </Nav.Link>
          <Nav.Link as={Link} to="/simulazione">
            Simulazione
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

export default CustomNavbar;
