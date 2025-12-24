import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);
            setSuccess('Registration successful! Redirecting...');
            login(res.data.token, res.data);
            setTimeout(() => {
                navigate(res.data.role === 'vendor' ? '/vendor-dashboard' : '/dashboard');
            }, 1000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        }
    };



    return (
        <div className="d-flex min-vh-100 align-items-stretch overflow-hidden">
            {/* Left Side - Image/Visuals */}
            <div className="d-none d-lg-block w-50 position-relative" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(74, 29, 29, 0.4)' }}></div>
                <div className="position-relative z-1 d-flex flex-column justify-content-center h-100 px-5 text-white text-center">
                    <h1 className="display-3 fw-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>Join the Empire</h1>
                    <p className="lead fs-3">"Begin your journey to creating or hosting the most spectacular events."</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-100 w-lg-50 bg-white d-flex align-items-center justify-content-center overflow-auto py-5">
                <Container style={{ maxWidth: '500px' }}>
                    <div className="text-center mb-5">
                        <Link to="/" className="text-decoration-none">
                            <h2 className="display-5 fw-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)' }}>EventEmpire</h2>
                        </Link>
                        <p className="text-muted mt-2">Create your free account</p>
                    </div>

                    {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                    {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}

                    {error && <Alert variant="danger" className="border-0 shadow-sm">{error}</Alert>}
                    {success && <Alert variant="success" className="border-0 shadow-sm">{success}</Alert>}

                    <Form onSubmit={handleRegister} className="animate-fade-in">
                        <Form.Group className="mb-4">
                            <Form.Label className="text-uppercase small fw-bold text-muted">Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-control-glass bg-light"
                                placeholder="Enter your name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-uppercase small fw-bold text-muted">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-control-glass bg-light"
                                placeholder="name@example.com"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-uppercase small fw-bold text-muted">Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="form-control-glass bg-light"
                                placeholder="Create a strong password"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-uppercase small fw-bold text-muted">I am a...</Form.Label>
                            <Form.Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="form-control-glass bg-light"
                            >
                                <option value="user">User (Planning an Event)</option>
                                <option value="vendor">Vendor (Offering Services)</option>
                                <option value="admin">Admin (Management)</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" className="w-100 btn-royal-gold py-3 fs-6 shadow-sm">
                            Create Account
                        </Button>
                    </Form>
                    <div className="text-center mt-5">
                        <p className="text-muted">Already have an account? <Link to="/login" className="fw-bold" style={{ color: 'var(--gold-primary)' }}>Sign In</Link></p>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Register;
