import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, ListGroup } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const GuestDashboard = () => {
    const { user } = useContext(AuthContext);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchInvitations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchInvitations = async () => {
        try {
            if (!user || !user.email) {
                console.log('No user or email found');
                setLoading(false);
                return;
            }
            console.log('Fetching invitations for:', user.email);
            const res = await axios.get(`http://localhost:5000/api/guests/by-email/${user.email}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Invitations response:', res.data);
            setInvitations(res.data || []);
        } catch (err) {
            console.error('Error fetching invitations:', err);
            if (err.response?.status === 404) {
                // No invitations found - this is okay
                setInvitations([]);
            } else if (err.response?.status === 401) {
                toast.error('Please login again');
            } else {
                toast.error('Failed to load invitations');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRSVP = async (guestId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/guests/${guestId}/rsvp`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`RSVP updated to ${status === 'accepted' ? 'Accepted' : 'Declined'}!`);
            fetchInvitations(); // Refresh
        } catch (err) {
            console.error(err);
            toast.error('Failed to update RSVP');
        }
    };

    return (
        <Container className="py-5" style={{ minHeight: '100vh' }}>
            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>
                    Welcome, {user?.name}!
                </h1>
                <p className="text-muted fs-5">Manage your event invitations</p>
            </div>

            {/* Stats Cards */}
            <Row className="g-4 mb-5">
                <Col md={4}>
                    <div className="glass-card p-4 text-center bg-white shadow-sm">
                        <i className="bi bi-envelope-paper display-4 text-warning mb-3"></i>
                        <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>{invitations.length}</h3>
                        <p className="text-muted mb-0">Total Invitations</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="glass-card p-4 text-center bg-white shadow-sm">
                        <i className="bi bi-check-circle display-4 text-success mb-3"></i>
                        <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                            {invitations.filter(i => i.rsvpStatus === 'accepted').length}
                        </h3>
                        <p className="text-muted mb-0">Accepted</p>
                    </div>
                </Col>
                <Col md={4}>
                    <div className="glass-card p-4 text-center bg-white shadow-sm">
                        <i className="bi bi-clock-history display-4 text-secondary mb-3"></i>
                        <h3 className="fw-bold" style={{ color: 'var(--text-primary)' }}>
                            {invitations.filter(i => i.rsvpStatus === 'pending').length}
                        </h3>
                        <p className="text-muted mb-0">Pending</p>
                    </div>
                </Col>
            </Row>

            {/* Invitations List */}
            <div className="glass-card p-4 bg-white shadow-lg">
                <h3 className="fw-bold mb-4" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>
                    Your Invitations
                </h3>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : invitations.length > 0 ? (
                    <Row className="g-4">
                        {invitations.map((invitation) => (
                            <Col md={6} lg={4} key={invitation._id}>
                                <Card className="h-100 border-0 shadow-sm">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <h5 className="fw-bold mb-0" style={{ color: 'var(--royal-accent)' }}>
                                                {invitation.event?.name}
                                            </h5>
                                            <Badge bg={
                                                invitation.rsvpStatus === 'accepted' ? 'success' :
                                                    invitation.rsvpStatus === 'rejected' ? 'danger' :
                                                        'secondary'
                                            }>
                                                {invitation.rsvpStatus === 'accepted' ? 'Accepted' :
                                                    invitation.rsvpStatus === 'rejected' ? 'Declined' :
                                                        'Pending'}
                                            </Badge>
                                        </div>

                                        <ListGroup variant="flush" className="mb-3">
                                            <ListGroup.Item className="px-0 border-0">
                                                <i className="bi bi-calendar me-2 text-warning"></i>
                                                <small>
                                                    {invitation.event?.date ? new Date(invitation.event.date).toLocaleDateString('en-IN', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }) : 'Date TBD'}
                                                </small>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="px-0 border-0">
                                                <i className="bi bi-clock me-2 text-warning"></i>
                                                <small>{invitation.event?.time || 'Time TBD'}</small>
                                            </ListGroup.Item>
                                            <ListGroup.Item className="px-0 border-0">
                                                <i className="bi bi-geo-alt me-2 text-warning"></i>
                                                <small>{invitation.event?.location || 'Location TBD'}</small>
                                            </ListGroup.Item>
                                        </ListGroup>

                                        {invitation.rsvpStatus === 'pending' ? (
                                            <div className="d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="success"
                                                    className="flex-grow-1"
                                                    onClick={() => handleRSVP(invitation._id, 'accepted')}
                                                >
                                                    <i className="bi bi-check-circle me-1"></i> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    className="flex-grow-1"
                                                    onClick={() => handleRSVP(invitation._id, 'rejected')}
                                                >
                                                    <i className="bi bi-x-circle me-1"></i> Decline
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                className="w-100"
                                                onClick={() => handleRSVP(invitation._id, 'pending')}
                                            >
                                                <i className="bi bi-arrow-clockwise me-1"></i> Change Response
                                            </Button>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-envelope display-1 text-muted mb-3"></i>
                        <h5 className="text-muted">No invitations yet</h5>
                        <p className="text-muted small">You'll see your event invitations here once you're invited</p>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default GuestDashboard;
