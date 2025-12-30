import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavigationBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = !user ? [] :
        user.role === 'vendor' ? [
            { label: 'Dashboard', path: '/vendor-dashboard' },
            { label: 'Messages', path: '/messages' },
        ] : user.role === 'guest' ? [
            { label: 'Dashboard', path: '/guest-dashboard' },
        ] : [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Find Vendors', path: '/find-vendors' },
            { label: 'Messages', path: '/messages' },
        ];

    return (
        <Navbar expand="lg" className="glass-nav mb-0 sticky-top py-3">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-3" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold-primary)' }}>
                    EventEmpire
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ borderColor: 'var(--gold-primary)' }} />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        {menuItems.map((item) => (
                            <Nav.Link key={item.label} as={Link} to={item.path} className="px-3" style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                                {item.label}
                            </Nav.Link>
                        ))}
                        {user ? (
                            <>
                                <Button variant="outline-light" as={Link} to="/profile" className="ms-2 btn-glass">
                                    Profile
                                </Button>
                                <Button variant="outline-light" onClick={handleLogout} className="ms-2 btn-royal-gold border-0">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline-light" as={Link} to="/login" className="ms-2 btn-glass">
                                    Login
                                </Button>
                                <Button variant="outline-light" as={Link} to="/register" className="ms-2 btn-royal-gold border-0">
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
