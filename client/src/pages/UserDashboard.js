import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        mapLink: '',
        type: '',
        description: '',
        organizerName: '',
    });
    const [message, setMessage] = useState(null);
    const [vendorCount, setVendorCount] = useState(0);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchEvents();
        fetchVendorCount();
        if (user) {
            setNewEvent(prev => ({ ...prev, organizerName: user.name }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token, navigate]);

    useEffect(() => {
        setFilteredEvents(
            events.filter(event =>
                event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.type.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, events]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents(res.data);
        } catch (err) {
            console.error('Error fetching events:', err);
            setMessage({ type: 'danger', text: 'Failed to fetch events.' });
            if (err.response && err.response.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const fetchVendorCount = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendors/search');
            setVendorCount(res.data.length);
        } catch (err) {
            console.error('Error fetching vendors:', err);
        }
    };

    const handleCreateEvent = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/events', newEvent, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEvents([...events, res.data]);
            setOpen(false);
            setNewEvent({
                name: '',
                date: '',
                time: '',
                location: '',
                mapLink: '',
                type: '',
                description: '',
                organizerName: user.name,
            });
            setMessage({ type: 'success', text: 'Event created successfully!' });
        } catch (err) {
            console.error('Error creating event:', err);
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to create event.' });
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(events.filter(event => event._id !== eventId));
                setMessage({ type: 'success', text: 'Event deleted successfully' });
            } catch (err) {
                console.error('Error deleting event:', err);
                setMessage({ type: 'danger', text: 'Failed to delete event' });
            }
        }
    };

    const handleEventClick = (eventId) => {
        navigate(`/events/${eventId}`);
    };

    const upcomingCount = events.filter(e => new Date(e.date) >= new Date()).length;

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="glass-card border-0 mb-4 shadow-sm">
                        {message.text}
                    </Alert>
                )}

                {/* Welcome Section */}
                <div className="mb-5">
                    <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>
                        Welcome back, {user?.name}!
                    </h1>
                    <p className="text-secondary fs-5 mb-4">Manage your plans, track budgets, and connect with vendors all in one place.</p>

                    <Row className="g-4 mb-4">
                        <Col md={3}>
                            <div className="glass-card h-100 text-center p-4 bg-white shadow-sm border-0">
                                <div className="display-4 mb-2" style={{ color: 'var(--gold-accent)' }}><i className="bi bi-calendar-event"></i></div>
                                <h2 className="fw-bold text-dark">{events.length}</h2>
                                <p className="text-muted small fw-bold text-uppercase ls-1">Total Events</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="glass-card h-100 text-center p-4 bg-white shadow-sm border-0">
                                <div className="display-4 mb-2 text-info"><i className="bi bi-calendar-check"></i></div>
                                <h2 className="fw-bold text-dark">{upcomingCount}</h2>
                                <p className="text-muted small fw-bold text-uppercase ls-1">Upcoming</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="glass-card h-100 text-center p-4 bg-white shadow-sm border-0">
                                <div className="display-4 mb-2 text-warning"><i className="bi bi-shop"></i></div>
                                <h2 className="fw-bold text-dark">{vendorCount}</h2>
                                <p className="text-muted small fw-bold text-uppercase ls-1">Available Vendors</p>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="glass-card h-100 d-flex flex-column justify-content-center p-4 bg-white shadow-sm border-0">
                                <Button className="w-100 mb-2 btn-royal-gold shadow-sm" onClick={() => setOpen(true)}>
                                    <i className="bi bi-plus-lg me-2"></i> Create Event
                                </Button>
                                <Button className="w-100 btn-glass shadow-sm text-dark border-0" onClick={() => navigate('/vendors')} style={{ background: '#f8f9fa' }}>
                                    <i className="bi bi-search me-2"></i> Find Vendors
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark" style={{ fontFamily: 'Playfair Display' }}>Your Events</h3>
                    <InputGroup style={{ maxWidth: '300px' }}>
                        <InputGroup.Text className="bg-white border-end-0 text-muted"><i className="bi bi-search"></i></InputGroup.Text>
                        <Form.Control
                            placeholder="Search events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control-glass border-start-0 bg-white ps-0 text-dark"
                        />
                    </InputGroup>
                </div>

                <Row>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map(event => (
                            <Col key={event._id} sm={12} md={6} lg={4} className="mb-4">
                                <div className="glass-card h-100 d-flex flex-column bg-white border-0 shadow-lg scale-hover" style={{ transition: 'transform 0.3s' }}>
                                    <div style={{
                                        height: '180px',
                                        background: 'linear-gradient(135deg, #FFC107 0%, #FF9800 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderTopLeftRadius: '15px',
                                        borderTopRightRadius: '15px',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div className="pattern-overlay opacity-25"></div>
                                        <i className="bi bi-stars display-1 text-white opacity-50"></i>
                                    </div>
                                    <div className="p-3 flex-grow-1 text-dark">
                                        <h4 className="fw-bold mb-2 text-truncate" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>{event.name}</h4>
                                        <p className="mb-1 small text-muted"><i className="bi bi-calendar me-2 text-warning"></i> {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                                        <p className="mb-2 small text-muted"><i className="bi bi-geo-alt me-2 text-warning"></i> {event.location}</p>
                                        <Badge bg="warning" text="dark" className="mb-2 rounded-pill px-3">{event.type}</Badge>
                                        <p className="small text-secondary text-truncate">{event.description}</p>
                                    </div>
                                    <div className="p-3 pt-0 d-flex justify-content-between">
                                        <Button className="btn-glass flex-grow-1 me-2 text-dark bg-light border-0 shadow-sm" onClick={() => handleEventClick(event._id)}>
                                            Manage
                                        </Button>
                                        <Button variant="outline-danger" className="border-0 bg-light-danger" onClick={() => handleDeleteEvent(event._id)}>
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        ))
                    ) : (
                        <Col>
                            <Alert variant="light" className="glass-card text-center border-0 shadow-sm py-5">
                                <i className="bi bi-calendar-x display-4 text-muted mb-3 d-block"></i>
                                <p className="lead text-muted">No events found. Create one or adjust your search to get started!</p>
                            </Alert>
                        </Col>
                    )}
                </Row>

                {/* Create New Event Modal */}
                <Modal show={open} onHide={() => setOpen(false)} centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="fw-bold text-dark" style={{ fontFamily: 'Playfair Display' }}>Create New Event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Event Name</Form.Label>
                                <Form.Control type="text" value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} placeholder="Enter event name" className="form-control-glass bg-light" />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-muted small fw-bold">Date</Form.Label>
                                        <Form.Control type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="form-control-glass bg-light" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-muted small fw-bold">Time</Form.Label>
                                        <Form.Control type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="form-control-glass bg-light" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Location</Form.Label>
                                <Form.Control type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Venue Address" className="form-control-glass bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Google Map Link (Optional)</Form.Label>
                                <Form.Control type="text" value={newEvent.mapLink} onChange={(e) => setNewEvent({ ...newEvent, mapLink: e.target.value })} placeholder="https://maps.google.com/..." className="form-control-glass bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Type</Form.Label>
                                <Form.Select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })} className="form-control-glass bg-light">
                                    <option value="">Select Type</option>
                                    <option value="Wedding">Wedding</option>
                                    <option value="Birthday">Birthday</option>
                                    <option value="Corporate">Corporate</option>
                                    <option value="Social">Social</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Description</Form.Label>
                                <Form.Control as="textarea" rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="form-control-glass bg-light" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-muted text-decoration-none" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button className="btn-royal-gold" onClick={handleCreateEvent}>Create Event</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default UserDashboard;
