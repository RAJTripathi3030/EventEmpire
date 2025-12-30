import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Modal, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

const PaymentManagement = ({ eventId }) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [bookings, setBookings] = useState([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentData, setPaymentData] = useState({
        amount: '',
        paymentType: 'partial',
        paymentMethod: 'online',
        notes: ''
    });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchBookings();
        // eslint-disable-next-line
    }, [eventId]);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings?eventId=${eventId}`, config);
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
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error recording payment' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking);
        const remaining = booking.totalAmount - (booking.totalPaid || 0);
        setPaymentData({ ...paymentData, amount: remaining });
        setShowPaymentModal(true);
    };

    const getPaymentStatusBadge = (booking) => {
        const totalPaid = booking.totalPaid || 0;
        const totalAmount = booking.totalAmount;

        if (totalPaid >= totalAmount) {
            return <Badge bg="success">Paid</Badge>;
        } else if (totalPaid > 0) {
            return <Badge bg="warning" text="dark">Partially Paid</Badge>;
        } else {
            return <Badge bg="secondary">Unpaid</Badge>;
        }
    };

    const getPaymentProgress = (booking) => {
        const totalPaid = booking.totalPaid || 0;
        const totalAmount = booking.totalAmount;
        return totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;
    };

    return (
        <div>
            {message && (
                <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                    {message.text}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>
            )}

            <Card className="glass-card border-0 shadow-sm mb-4">
                <Card.Header className="bg-transparent border-0 py-3">
                    <h4 className="mb-0 fw-bold" style={{ color: 'var(--royal-accent)' }}>
                        <i className="bi bi-credit-card me-2"></i>Vendor Payments
                    </h4>
                </Card.Header>
                <Card.Body>
                    {bookings.length > 0 ? (
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th>Vendor</th>
                                    <th>Service</th>
                                    <th>Total Amount</th>
                                    <th>Paid</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => {
                                    const totalPaid = booking.totalPaid || 0;
                                    const remaining = booking.totalAmount - totalPaid;
                                    const progress = getPaymentProgress(booking);

                                    return (
                                        <tr key={booking._id}>
                                            <td className="fw-medium">
                                                {booking.vendor?.businessName || 'N/A'}
                                            </td>
                                            <td>{booking.serviceType}</td>
                                            <td className="fw-bold">₹{booking.totalAmount.toFixed(2)}</td>
                                            <td className="text-success fw-bold">₹{totalPaid.toFixed(2)}</td>
                                            <td className="text-danger fw-bold">₹{remaining.toFixed(2)}</td>
                                            <td>{getPaymentStatusBadge(booking)}</td>
                                            <td style={{ width: '150px' }}>
                                                <ProgressBar
                                                    now={progress}
                                                    variant={progress === 100 ? 'success' : progress > 0 ? 'warning' : 'secondary'}
                                                    label={`${Math.round(progress)}%`}
                                                    style={{ height: '20px' }}
                                                />
                                            </td>
                                            <td>
                                                {remaining > 0 && (
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => openPaymentModal(booking)}
                                                    >
                                                        <i className="bi bi-cash-coin me-1"></i>
                                                        Pay
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted py-5">
                            <i className="bi bi-inbox display-4 d-block mb-3"></i>
                            <p>No vendor bookings for this event yet.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold" style={{ color: 'var(--royal-accent)' }}>
                        Make Payment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedBooking && (
                        <>
                            <div className="mb-3 p-3 bg-light rounded">
                                <Row>
                                    <Col xs={6}>
                                        <small className="text-muted">Vendor</small>
                                        <p className="mb-0 fw-bold">{selectedBooking.vendor?.businessName}</p>
                                    </Col>
                                    <Col xs={6}>
                                        <small className="text-muted">Service</small>
                                        <p className="mb-0 fw-bold">{selectedBooking.serviceType}</p>
                                    </Col>
                                </Row>
                                <hr />
                                <Row>
                                    <Col xs={4}>
                                        <small className="text-muted">Total</small>
                                        <p className="mb-0 fw-bold">₹{selectedBooking.totalAmount}</p>
                                    </Col>
                                    <Col xs={4}>
                                        <small className="text-muted">Paid</small>
                                        <p className="mb-0 fw-bold text-success">₹{selectedBooking.totalPaid || 0}</p>
                                    </Col>
                                    <Col xs={4}>
                                        <small className="text-muted">Remaining</small>
                                        <p className="mb-0 fw-bold text-danger">
                                            ₹{selectedBooking.totalAmount - (selectedBooking.totalPaid || 0)}
                                        </p>
                                    </Col>
                                </Row>
                            </div>

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Payment Amount</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Enter amount"
                                        value={paymentData.amount}
                                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                        min="0"
                                        max={selectedBooking.totalAmount - (selectedBooking.totalPaid || 0)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Payment Type</Form.Label>
                                    <Form.Select
                                        value={paymentData.paymentType}
                                        onChange={(e) => setPaymentData({ ...paymentData, paymentType: e.target.value })}
                                    >
                                        <option value="advance">Advance</option>
                                        <option value="partial">Partial</option>
                                        <option value="final">Final</option>
                                        <option value="full">Full Payment</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Payment Method</Form.Label>
                                    <Form.Select
                                        value={paymentData.paymentMethod}
                                        onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="online">Online Transfer</option>
                                        <option value="card">Card</option>
                                        <option value="upi">UPI</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Notes (Optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        placeholder="Add any notes about this payment"
                                        value={paymentData.notes}
                                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="btn-royal-gold"
                        onClick={handleMakePayment}
                        disabled={!paymentData.amount || paymentData.amount <= 0}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        Record Payment
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PaymentManagement;
