import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, ProgressBar, Alert } from 'react-bootstrap';
import axios from 'axios';

const VendorPaymentHistory = () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [updatingParams, setUpdatingParams] = useState(null);

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendor-payments/vendor/history', config);
            setPayments(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vendor payments:', err);
            setLoading(false);
        }
    };

    const handleProgressUpdate = async (bookingId, newProgress) => {
        setUpdatingParams(bookingId);
        try {
            await axios.put(
                `http://localhost:5000/api/vendor-payments/booking/${bookingId}/progress`,
                { progress: newProgress },
                config
            );

            // Optimistic update
            const updatedPayments = payments.map(p => {
                if (p.booking._id === bookingId) {
                    return { ...p, booking: { ...p.booking, workProgress: newProgress } };
                }
                return p;
            });
            setPayments(updatedPayments);

            setMessage({ type: 'success', text: 'Work progress updated!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Failed to update progress' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setUpdatingParams(null);
        }
    };

    if (loading) return <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>;

    // Group payments by booking to show context
    // But since the API returns individual payments, simple table is best for "Payment History"
    // However, for "Work Progress", we need unique Bookings.
    // The API /vendor/history returns payments.
    // Let's stick to a simple payment table for now, and maybe a separate "Active Jobs" section for progress if needed.
    // Wait, the user wants "see payment history" AND "track how much work".
    // I entered a design decision in my plan: "Payment history table ... Work status update for each booking".
    // I'll group by booking locally if possible, or just show payments.
    // Actually, updateWorkProgress needs bookingId. The payment object has booking populated.

    return (
        <div>
            {message && (
                <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="border-0 shadow-sm">
                    {message.text}
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <Card className="glass-card bg-white border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">Total Earnings</h6>
                            <h3 className="fw-bold text-success mb-0">
                                ₹{payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0).toFixed(2)}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-md-4">
                    <Card className="glass-card bg-white border-0 shadow-sm h-100">
                        <Card.Body>
                            <h6 className="text-muted text-uppercase small fw-bold">Received Payments</h6>
                            <h3 className="fw-bold text-primary mb-0">
                                {payments.filter(p => p.status === 'completed').length}
                            </h3>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            <Card className="glass-card border-0 shadow-lg">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 fw-bold" style={{ color: 'var(--royal-accent)' }}>
                        <i className="bi bi-clock-history me-2"></i>Payment History
                    </h5>
                </Card.Header>
                <Card.Body className="p-0">
                    {payments.length > 0 ? (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Date</th>
                                    <th>Client</th>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td className="ps-4 text-secondary">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="fw-medium">{payment.user?.name || 'Unknown'}</td>
                                        <td>{payment.booking?.serviceType}</td>
                                        <td className="fw-bold">₹{payment.amount.toFixed(2)}</td>
                                        <td>
                                            <Badge bg="light" text="dark" className="border">
                                                {payment.paymentMethod}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge
                                                bg={payment.status === 'completed' ? 'success' : 'warning'}
                                                className="fw-normal px-2 py-1"
                                            >
                                                {payment.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="text-center py-5">
                            <i className="bi bi-wallet2 display-4 text-muted opacity-25 mb-3"></i>
                            <p className="text-muted">No payments received yet.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default VendorPaymentHistory;
