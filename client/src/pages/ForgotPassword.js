import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            setStep(2);
            setSuccess('OTP sent to your email. Please check your inbox.');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            setSuccess('Password reset successful. Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="glass-card p-4 p-md-5 w-100" style={{ maxWidth: '450px' }}>
                <h2 className="text-center mb-4 fw-bold" style={{ fontFamily: 'Playfair Display', color: 'var(--gold-primary)' }}>
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {error && <Alert variant="danger" className="text-center border-danger bg-transparent text-danger">{error}</Alert>}
                {success && <Alert variant="success" className="text-center border-success bg-transparent text-success">{success}</Alert>}

                {step === 1 ? (
                    <Form onSubmit={handleRequestOtp}>
                        <p className="text-light text-center mb-4 opacity-75">
                            Enter your email address to receive a one-time password (OTP).
                        </p>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-light">Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-control-glass"
                                placeholder="name@example.com"
                            />
                        </Form.Group>
                        <Button type="submit" className="w-100 btn-royal-gold mb-3">
                            Send OTP
                        </Button>
                        <Button variant="link" className="w-100 text-light text-decoration-none" onClick={() => navigate('/login')}>
                            <i className="bi bi-arrow-left me-2"></i> Back to Login
                        </Button>
                    </Form>
                ) : (
                    <Form onSubmit={handleResetPassword}>
                        <p className="text-light text-center mb-4 opacity-75">
                            Enter the OTP sent to <strong>{email}</strong> and your new password.
                        </p>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-light">OTP</Form.Label>
                            <Form.Control
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="form-control-glass"
                                placeholder="Enter OTP"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-light">New Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="form-control-glass"
                                placeholder="Enter new password"
                            />
                        </Form.Group>
                        <Button type="submit" className="w-100 btn-royal-gold mb-3">
                            Reset Password
                        </Button>
                        <Button variant="link" className="w-100 text-light text-decoration-none" onClick={() => setStep(1)}>
                            <i className="bi bi-arrow-left me-2"></i> Back
                        </Button>
                    </Form>
                )}
            </div>
        </Container>
    );
};

export default ForgotPassword;
