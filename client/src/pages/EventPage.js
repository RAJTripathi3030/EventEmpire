import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Nav, Button, Form, Modal, ListGroup, Alert, ProgressBar, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PaymentManagement from '../components/PaymentManagement';

const EventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [event, setEvent] = useState(null);
    const [guests, setGuests] = useState([]);
    const [budget, setBudget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [newGuest, setNewGuest] = useState({ name: '', email: '' });
    const [message, setMessage] = useState(null);

    // Edit Event State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editEventData, setEditEventData] = useState({
        name: '',
        date: '',
        time: '',
        location: '',
        mapLink: '',
        type: '',
        description: '',
    });

    // Budget State
    const [totalBudget, setTotalBudget] = useState(0);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: '', status: 'pending' });
    const [showBudgetModal, setShowBudgetModal] = useState(false);

    // Vendor Payment State
    const [bookings, setBookings] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentType: 'partial',
        paymentMethod: 'online',
        notes: ''
    });

    useEffect(() => {
        fetchEventDetails();
        fetchGuests();
        fetchBudgetDetails();
        fetchBookings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchEventDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/events/${id}`, config);
            setEvent(res.data);
            setEditEventData({
                name: res.data.name,
                date: res.data.date.split('T')[0],
                time: res.data.time,
                location: res.data.location,
                mapLink: res.data.mapLink || '',
                type: res.data.type,
                description: res.data.description,
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
            setMessage({ type: 'danger', text: 'Error fetching event details' });
        }
    };

    const fetchGuests = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/guests/${id}`, config);
            setGuests(res.data);
        } catch (err) {
            console.error("Error fetching guests:", err);
        }
    };

    const fetchBudgetDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/budget/${id}`, config);
            if (res.data) {
                setBudget(res.data);
                setTotalBudget(res.data.totalBudget);
            }
        } catch (err) {
            console.error("Error fetching budget:", err);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings?eventId=${id}`, config);
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };

    const handleMakePayment = async () => {
        try {
            await axios.post(`http://localhost:5000/api/vendor-payments/${selectedBooking._id}`, paymentData, config);
            setShowPaymentModal(false);
            setPaymentData({ amount: '', paymentType: 'partial', paymentMethod: 'online', notes: '' });
            fetchBookings();
            setMessage({ type: 'success', text: 'Payment recorded successfully!' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error recording payment' });
        }
    };

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking);
        const remaining = booking.totalAmount - (booking.totalPaid || 0);
        setPaymentData({ ...paymentData, amount: remaining });
        setShowPaymentModal(true);
    };

    const handleUpdateEvent = async () => {
        try {
            const res = await axios.put(`http://localhost:5000/api/events/${id}`, editEventData, config);
            setEvent(res.data);
            setShowEditModal(false);
            setMessage({ type: 'success', text: 'Event updated successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating event' });
        }
    };

    const handleAddGuest = async () => {
        try {
            await axios.post(`http://localhost:5000/api/guests/${id}/invite`, newGuest, config);
            fetchGuests();
            setShowGuestModal(false);
            setNewGuest({ name: '', email: '' });
            setMessage({ type: 'success', text: 'Guest invited successfully' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Error adding guest' });
        }
    };

    const handleUpdateBudget = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/budget/${id}`, { totalBudget: Number(totalBudget) }, config);
            setBudget(res.data);
            setMessage({ type: 'success', text: 'Budget updated successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating budget' });
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`http://localhost:5000/api/budget/${id}/expense`, {
                title: newExpense.title,
                amount: Number(newExpense.amount),
                category: newExpense.category
            }, config);

            setBudget(res.data.budget);
            setNewExpense({ title: '', amount: '', category: '' });
            setShowBudgetModal(false);

            if (res.data.alert) {
                setMessage({ type: 'warning', text: 'Warning: You are close to or have exceeded your budget limit!' });
            } else {
                setMessage({ type: 'success', text: 'Expense added successfully' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error adding expense' });
        }
    };

    const handleUpdateExpenseStatus = async (expenseId, newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/budget/${id}/expense/${expenseId}/status`, {
                status: newStatus
            }, config);

            setBudget(res.data.budget);
            setMessage({ type: 'success', text: `Status updated to ${newStatus}` });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error updating expense status' });
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            const res = await axios.delete(`http://localhost:5000/api/budget/${id}/expense/${expenseId}`, config);
            setBudget(res.data.budget);
            setMessage({ type: 'success', text: 'Expense deleted successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error deleting expense' });
        }
    };

    if (loading) return <Container className="mt-4 text-center"><div className="spinner-border text-primary" role="status"></div></Container>;
    if (!event) return <Container className="mt-4 text-center"><h3>Event not found</h3></Container>;

    const totalSpent = budget?.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const remainingBudget = (budget?.totalBudget || 0) - totalSpent;
    const progressVariant = remainingBudget < 0 ? 'danger' : remainingBudget < (budget?.totalBudget * 0.2) ? 'warning' : 'success';
    const progressPercentage = budget?.totalBudget ? Math.min((totalSpent / budget.totalBudget) * 100, 100) : 0;

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="glass-card border-0 mb-4 shadow-sm">
                        {message.text}
                    </Alert>
                )}
                {remainingBudget < 0 && (
                    <Alert variant="danger" className="mb-4 glass-card border-danger text-danger">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Budget Exceeded!</strong> You have spent ₹{Math.abs(remainingBudget).toFixed(2)} over your budget.
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h1 className="display-4 fw-bold mb-1" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>{event.name}</h1>
                        <p className="text-muted fs-5"><i className="bi bi-calendar3 me-2"></i>{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="outline-dark" onClick={() => navigate('/dashboard')} className="btn-glass shadow-sm">Back to Dashboard</Button>
                </div>

                <Tab.Container defaultActiveKey="details">
                    <Nav variant="pills" className="mb-4 glass-nav p-2 rounded justify-content-center border-0 shadow-sm" style={{ background: '#fff' }}>
                        <Nav.Item>
                            <Nav.Link eventKey="details" className="text-dark fw-bold mx-2">Details</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="guests" className="text-dark fw-bold mx-2">Guests</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="budget" className="text-dark fw-bold mx-2">Budget</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="payments" className="text-dark fw-bold mx-2">
                                <i className="bi bi-credit-card me-1"></i>Vendor Payments
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane eventKey="details">
                            <div className="glass-card bg-white text-dark">
                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <h3 className="fw-bold" style={{ color: 'var(--gold-primary)' }}>Event Details</h3>
                                    <Button className="btn-royal-gold btn-sm" onClick={() => setShowEditModal(true)}>
                                        <i className="bi bi-pencil me-2"></i> Edit
                                    </Button>
                                </div>
                                <Row className="g-4">
                                    <Col md={6}>
                                        <p className="mb-3"><i className="bi bi-clock me-3 text-warning fs-5"></i> <strong>Time:</strong> {event.time}</p>
                                        <p className="mb-3"><i className="bi bi-geo-alt me-3 text-warning fs-5"></i> <strong>Location:</strong> {event.location}</p>
                                        {event.mapLink && (
                                            <p className="mb-3"><i className="bi bi-map me-3 text-warning fs-5"></i> <a href={event.mapLink} target="_blank" rel="noopener noreferrer" className="text-primary">View on Map</a></p>
                                        )}
                                    </Col>
                                    <Col md={6}>
                                        <p className="mb-3"><i className="bi bi-tag me-3 text-warning fs-5"></i> <strong>Type:</strong> <Badge bg="warning" text="dark">{event.type}</Badge></p>
                                        <div className="mt-3 p-3 rounded bg-light border">
                                            <p className="mb-2 text-warning fw-bold">Description:</p>
                                            <p className="mb-0 text-secondary">{event.description || 'No description provided.'}</p>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="guests">
                            <div className="glass-card bg-white text-dark">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h3 className="fw-bold" style={{ color: 'var(--gold-primary)' }}>Guest List</h3>
                                    <Button className="btn-royal-gold btn-sm" onClick={() => setShowGuestModal(true)}>
                                        <i className="bi bi-envelope me-2"></i> Invite Guest
                                    </Button>
                                </div>
                                <ListGroup variant="flush">
                                    {guests.length === 0 ? (
                                        <ListGroup.Item className="text-muted border-0 text-center py-5">
                                            <i className="bi bi-people display-4 d-block mb-3"></i>
                                            No guests invited yet. Click "Invite Guest" to start!
                                        </ListGroup.Item>
                                    ) : (
                                        guests.map((guest, index) => (
                                            <ListGroup.Item key={index} className="border-bottom d-flex justify-content-between align-items-center py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-light rounded-circle p-2 text-warning">
                                                        <i className="bi bi-person-fill fs-4"></i>
                                                    </div>
                                                    <div>
                                                        <strong className="d-block text-dark">{guest.name}</strong>
                                                        <span className="small text-muted">{guest.email}</span>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Badge bg={
                                                        guest.rsvpStatus === 'accepted' ? 'success' :
                                                            guest.rsvpStatus === 'rejected' ? 'danger' :
                                                                'secondary'
                                                    } pill>
                                                        {guest.rsvpStatus === 'accepted' ? 'Accepted' :
                                                            guest.rsvpStatus === 'rejected' ? 'Declined' :
                                                                'Pending'}
                                                    </Badge>
                                                    {guest.isInvited && <Badge bg="info" pill>Invited</Badge>}
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    )}
                                </ListGroup>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="budget">
                            <div className="glass-card bg-white text-dark">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h3 className="fw-bold" style={{ color: 'var(--gold-primary)' }}>Budget Tracker</h3>
                                    <Button className="btn-royal-gold btn-sm" onClick={() => setShowBudgetModal(true)}>
                                        <i className="bi bi-plus-circle me-2"></i> Add Expense
                                    </Button>
                                </div>

                                <div className="p-4 mb-4 rounded bg-light border shadow-sm">
                                    <Row className="align-items-end g-3">
                                        <Col md={4}>
                                            <Form.Group>
                                                <Form.Label className="text-dark fw-bold">Total Budget (₹)</Form.Label>
                                                <div className="d-flex gap-2">
                                                    <Form.Control
                                                        type="number"
                                                        value={totalBudget}
                                                        onChange={(e) => setTotalBudget(e.target.value)}
                                                        className="form-control-glass bg-white"
                                                    />
                                                    <Button variant="outline-warning" onClick={handleUpdateBudget}>Update</Button>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4} className="text-center border-end border-start">
                                            <h6 className="text-muted text-uppercase small ls-1">Total Spent</h6>
                                            <h3 className="text-danger fw-bold">₹{totalSpent.toFixed(2)}</h3>
                                        </Col>
                                        <Col md={4} className="text-center">
                                            <h6 className="text-muted text-uppercase small ls-1">Remaining</h6>
                                            <h3 className={`fw-bold text-${remainingBudget < 0 ? 'danger' : 'success'}`}>
                                                ₹{remainingBudget.toFixed(2)}
                                            </h3>
                                        </Col>
                                    </Row>
                                    <div className="mt-4">
                                        <ProgressBar now={progressPercentage} variant={progressVariant} label={`${progressPercentage.toFixed(0)}%`} style={{ height: '20px' }} />
                                    </div>
                                </div>

                                <h4 className="mt-5 mb-3 fw-bold ps-2 border-start border-4 border-warning">Expense Log</h4>
                                <Table hover responsive className="align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th className="text-end">Amount</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {budget?.expenses?.length > 0 ? (
                                            budget.expenses.map((expense, index) => (
                                                <tr key={index}>
                                                    <td className="fw-medium">{expense.title}</td>
                                                    <td><Badge bg="info" className="text-dark bg-opacity-25 border border-info">{expense.category}</Badge></td>
                                                    <td>
                                                        <Form.Select
                                                            size="sm"
                                                            value={expense.status || 'pending'}
                                                            onChange={(e) => handleUpdateExpenseStatus(expense._id, e.target.value)}
                                                            className="w-auto"
                                                            style={{
                                                                backgroundColor: expense.status === 'completed' ? '#d1e7dd' :
                                                                    expense.status === 'paid' ? '#cfe2ff' :
                                                                        expense.status === 'partially_done' ? '#fff3cd' : '#f8f9fa',
                                                                border: `1px solid ${expense.status === 'completed' ? '#198754' :
                                                                    expense.status === 'paid' ? '#0d6efd' :
                                                                        expense.status === 'partially_done' ? '#ffc107' : '#6c757d'}`,
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="partially_done">Partially Done</option>
                                                            <option value="paid">Paid</option>
                                                            <option value="completed">Completed</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td className="text-end fw-bold text-dark">₹{expense.amount.toFixed(2)}</td>
                                                    <td className="text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteExpense(expense._id)}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">No expenses recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="payments">
                            <div className="d-flex justify-content-end mb-3">
                                <Button
                                    className="btn-royal-gold"
                                    onClick={() => navigate(`/find-vendors?eventId=${id}`)}
                                >
                                    <i className="bi bi-person-plus me-2"></i>Find New Vendor
                                </Button>
                            </div>
                            <PaymentManagement eventId={id} />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>

                {/* Modals - Clean Light Theme */}
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="fw-bold text-dark">Edit Event</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Event Name</Form.Label>
                                <Form.Control type="text" value={editEventData.name} onChange={(e) => setEditEventData({ ...editEventData, name: e.target.value })} className="form-control-glass bg-light" />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-muted small fw-bold">Date</Form.Label>
                                        <Form.Control type="date" value={editEventData.date} onChange={(e) => setEditEventData({ ...editEventData, date: e.target.value })} className="form-control-glass bg-light" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-muted small fw-bold">Time</Form.Label>
                                        <Form.Control type="time" value={editEventData.time} onChange={(e) => setEditEventData({ ...editEventData, time: e.target.value })} className="form-control-glass bg-light" />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Location</Form.Label>
                                <Form.Control type="text" value={editEventData.location} onChange={(e) => setEditEventData({ ...editEventData, location: e.target.value })} className="form-control-glass bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Map Link</Form.Label>
                                <Form.Control type="text" value={editEventData.mapLink} onChange={(e) => setEditEventData({ ...editEventData, mapLink: e.target.value })} className="form-control-glass bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Description</Form.Label>
                                <Form.Control as="textarea" rows={3} value={editEventData.description} onChange={(e) => setEditEventData({ ...editEventData, description: e.target.value })} className="form-control-glass bg-light" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-muted text-decoration-none" onClick={() => setShowEditModal(false)}>Cancel</Button>
                        <Button className="btn-royal-gold" onClick={handleUpdateEvent}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>

                {/* Add Guest Modal */}
                <Modal show={showGuestModal} onHide={() => setShowGuestModal(false)} centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="fw-bold text-dark">Invite Guest</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Name</Form.Label>
                                <Form.Control type="text" value={newGuest.name} onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} className="form-control-glass bg-light" placeholder="e.g. Aditi Sharma" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Email</Form.Label>
                                <Form.Control type="email" value={newGuest.email} onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} className="form-control-glass bg-light" placeholder="e.g. aditi@example.com" />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-muted text-decoration-none" onClick={() => setShowGuestModal(false)}>Cancel</Button>
                        <Button className="btn-royal-gold" onClick={handleAddGuest}>Send Invitation</Button>
                    </Modal.Footer>
                </Modal>

                {/* Add Expense Modal */}
                <Modal show={showBudgetModal} onHide={() => setShowBudgetModal(false)} centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="fw-bold text-dark">Add Expense</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white">
                        <Form onSubmit={handleAddExpense}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Title</Form.Label>
                                <Form.Control type="text" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} className="form-control-glass bg-light" required placeholder="e.g. Rose Garlands" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Category</Form.Label>
                                <Form.Select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="form-control-glass bg-light" required>
                                    <option value="">Select Category</option>
                                    <option value="Venue">Venue</option>
                                    <option value="Catering">Catering</option>
                                    <option value="Decoration">Decoration</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Amount (₹)</Form.Label>
                                <Form.Control type="number" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} className="form-control-glass bg-light" required placeholder="0.00" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted small fw-bold">Status</Form.Label>
                                <Form.Select value={newExpense.status} onChange={(e) => setNewExpense({ ...newExpense, status: e.target.value })} className="form-control-glass bg-light">
                                    <option value="pending">Pending</option>
                                    <option value="partially_done">Partially Done</option>
                                    <option value="completed">Completed</option>
                                </Form.Select>
                            </Form.Group>
                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Button variant="link" className="text-muted text-decoration-none" onClick={() => setShowBudgetModal(false)}>Cancel</Button>
                                <Button className="btn-royal-gold" type="submit">Add Expense</Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default EventPage;
