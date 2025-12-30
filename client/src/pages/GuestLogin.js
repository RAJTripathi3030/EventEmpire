import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GuestLogin = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // For now, we'll just fetch invitations directly by email
            // In production, you'd send OTP first
            const res = await axios.get(`http://localhost:5000/api/guests/by-email/${email}`);
            if (res.data.length > 0) {
                setInvitations(res.data);
                setStep(2);
                toast.success('Invitations loaded!');
            } else {
                toast.error('No invitations found for this email');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to find invitations');
        }
        setLoading(false);
    };

    const handleRSVP = async (guestId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/guests/${guestId}/rsvp`, { status });
            toast.success(`RSVP updated to ${status}!`);
            // Refresh invitations
            const res = await axios.get(`http://localhost:5000/api/guests/by-email/${email}`);
            setInvitations(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update RSVP');
        }
    };

    return (
        <Container className="py-5" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <div className="glass-card p-5 bg-white shadow-lg">
                        <div className="text-center mb-4">
                            <h2 className="fw-bold" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>
                                Guest RSVP
                            </h2>
                            <p className="text-muted">Check your event invitations</p>
                        </div>

                        {step === 1 ? (
                            <Form onSubmit={handleSendOTP}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="form-control-glass bg-light"
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Enter the email address you were invited with
                                    </Form.Text>
                                </Form.Group>
                                <Button type="submit" className="w-100 btn-royal-gold" disabled={loading}>
                                    {loading ? 'Loading...' : 'View My Invitations'}
                                </Button>
                            </Form>
                        ) : (
                            <div>
                                <div className="mb-4 text-center">
                                    <p className="text-muted">Logged in as: <strong>{email}</strong></p>
                                    <Button variant="link" onClick={() => setStep(1)} className="text-decoration-none">
                                        Change Email
                                    </Button>
                                </div>

                                {invitations.length > 0 ? (
                                    <div>
                                        <h5 className="mb-3">Your Invitations</h5>
                                        {invitations.map((invitation) => (
                                            <Card key={invitation._id} className="mb-3 border-0 shadow-sm">
                                                <Card.Body>
                                                    <h5 className="fw-bold" style={{ color: 'var(--royal-accent)' }}>
                                                        {invitation.event?.name}
                                                    </h5>
                                                    <p className="mb-2">
                                                        <i className="bi bi-calendar me-2 text-warning"></i>
                                                        {new Date(invitation.event?.date).toLocaleDateString('en-IN', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="mb-2">
                                                        <i className="bi bi-clock me-2 text-warning"></i>
                                                        {invitation.event?.time}
                                                    </p>
                                                    <p className="mb-3">
                                                        <i className="bi bi-geo-alt me-2 text-warning"></i>
                                                        {invitation.event?.location}
                                                    </p>

                                                    <div className="d-flex gap-2 align-items-center">
                                                        <span className="me-2">RSVP Status:</span>
                                                        {invitation.rsvpStatus === 'pending' ? (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="success"
                                                                    onClick={() => handleRSVP(invitation._id, 'accepted')}
                                                                >
                                                                    <i className="bi bi-check-circle me-1"></i> Accept
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="danger"
                                                                    onClick={() => handleRSVP(invitation._id, 'rejected')}
                                                                >
                                                                    <i className="bi bi-x-circle me-1"></i> Decline
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <span className={`badge ${invitation.rsvpStatus === 'accepted' ? 'bg-success' : 'bg-danger'}`}>
                                                                {invitation.rsvpStatus === 'accepted' ? 'Accepted' : 'Declined'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-envelope display-1 text-muted mb-3"></i>
                                        <p className="text-muted">No invitations found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default GuestLogin;
