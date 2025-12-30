import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

// Import local asset for offline capability
import loginBackground from '../assets/login_background.jpg';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (step === 1) {
                const res = await axios.post('http://localhost:5000/api/auth/login', formData);
                if (res.data.requiresOtp) {
                    setUserId(res.data.userId);
                    setStep(2);
                    toast.success('OTP sent to your email. Please check your inbox.');
                } else {
                    login(res.data.token, res.data);
                    toast.success('Login successful! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 500);
                }
            } else {
                const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                    userId,
                    otp
                });
                login(res.data.token, res.data);
                toast.success('Welcome back!');
                setTimeout(() => {
                    if (res.data.role === 'vendor') {
                        navigate('/vendor-dashboard');
                    } else if (res.data.role === 'guest') {
                        navigate('/guest-dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 500);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 align-items-stretch overflow-hidden">
            {/* Left Side - Image/GIF */}
            <div className="d-none d-lg-block w-50 position-relative" style={{
                backgroundImage: `url(${loginBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(74, 29, 29, 0.4)' }}></div>
                <div className="position-relative z-1 d-flex flex-column justify-content-center h-100 px-5 text-white text-center">
                    <h1 className="display-3 fw-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>Welcome Back</h1>
                    <p className="lead fs-3">"Every event is a story waiting to be told. Let's continue yours."</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-100 w-lg-50 bg-white d-flex align-items-center justify-content-center overflow-auto py-5">
                <Container style={{ maxWidth: '450px' }}>
                    <div className="text-center mb-5">
                        <Link to="/" className="text-decoration-none">
                            <h2 className="display-5 fw-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)' }}>EventEmpire</h2>
                        </Link>
                        <p className="text-muted mt-2">Log in to your account</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="animate-fade-in">
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
                                        disabled={loading}
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
                                        placeholder="Enter your password"
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100 btn-royal-gold py-3 fs-6 shadow-sm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                                <div className="text-center mt-3">
                                    <Link to="/forgot-password" style={{ color: 'var(--gold-accent)' }}>Forgot Password?</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="alert alert-info bg-light border-0 text-dark mb-4 text-center">
                                    <i className="bi bi-envelope-paper me-2"></i> Enter the OTP sent to your email.
                                </div>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-uppercase small fw-bold text-muted">One-Time Password</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        className="form-control-glass bg-light text-center"
                                        style={{ letterSpacing: '2px', fontSize: '1.2rem' }}
                                        placeholder="• • • • • •"
                                        disabled={loading}
                                    />
                                </Form.Group>
                                <Button
                                    type="submit"
                                    className="w-100 btn-royal-gold py-3 shadow-sm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Login'
                                    )}
                                </Button>
                            </div>
                        )}
                    </Form>
                    <div className="text-center mt-5">
                        <p className="text-muted">Not registered yet? <Link to="/register" className="fw-bold" style={{ color: 'var(--gold-primary)' }}>Create an Account</Link></p>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Login;
