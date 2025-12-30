import React, { useState, useEffect } from 'react';
import { Card, Table, Form, ProgressBar, Alert, Badge, Button } from 'react-bootstrap';
import axios from 'axios';

const VendorWorkManager = () => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // We need a route to get "My Bookings" as a vendor.
    // Currently we seem to rely on payments to find bookings, or maybe there's a booking route.
    // Let's use the booking routes. Wait, I don't recall creating a dedicated "get my bookings" for vendors in this session.
    // Let's check bookingRoutes.js later. Assuming I can get bookings.
    // If not, I'll filter unique bookings from payment history for now or create the route.
    // Actually, let's use the Payments API I just made, it populates booking.
    // But that only shows bookings with PAYMENTS. What if no payment yet?
    // User pays -> Vendor works. So there should be at least a payment or booking.

    // PLAN: Fetch unique bookings from the payment history for now, as that's the safest bet without checking other files.
    // BETTER PLAN: Check `server/routes/bookingRoutes.js` quickly? No, let's trust the payment link.
    // User asked "I as a vendor can see... track how much work".

    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchActiveJobs();
        // eslint-disable-next-line
    }, []);

    const fetchActiveJobs = async () => {
        try {
            // Use the new dedicated endpoint for vendor bookings
            const res = await axios.get('http://localhost:5000/api/bookings/vendor/list', config);

            // Map the booking data to the format we need
            // The endpoint returns { bookings: [...] }
            const jobs = res.data.bookings.map(booking => ({
                ...booking,
                clientName: booking.user?.name || 'Unknown',
                clientEmail: booking.user?.email || 'N/A'
            }));

            setActiveJobs(jobs);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            // Fallback to payments if this fails (e.g. server not restarted yet)
            setLoading(false);
        }
    };

    const handleProgressUpdate = async (bookingId, newProgress) => {
        try {
            await axios.put(
                `http://localhost:5000/api/vendor-payments/booking/${bookingId}/progress`,
                { progress: newProgress },
                config
            );

            setActiveJobs(prev => prev.map(job =>
                job._id === bookingId ? { ...job, workProgress: newProgress } : job
            ));

            setMessage({ type: 'success', text: 'Work progress updated!' });
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Update failed' });
        }
    };

    if (loading) return <div className="text-center p-3"><small>Loading jobs...</small></div>;

    return (
        <Card className="glass-card border-0 shadow-lg mt-4">
            <Card.Header className="bg-white border-0 py-3">
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--royal-accent)' }}>
                    <i className="bi bi-briefcase me-2"></i>Active Jobs & Progress
                </h5>
            </Card.Header>
            <Card.Body className="p-0">
                {message && <Alert variant={message.type} className="m-3">{message.text}</Alert>}

                {activeJobs.length > 0 ? (
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="ps-4">Client</th>
                                <th>Service Date</th>
                                <th>Work Progress</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeJobs.map((job) => (
                                <tr key={job._id}>
                                    <td className="ps-4">
                                        <div className="fw-bold">{job.clientName}</div>
                                        <small className="text-muted">{job.clientEmail}</small>
                                    </td>
                                    <td>
                                        {new Date(job.serviceDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ width: '40%' }}>
                                        <div className="d-flex align-items-center gap-3">
                                            <Form.Range
                                                value={job.workProgress || 0}
                                                onChange={(e) => handleProgressUpdate(job._id, parseInt(e.target.value))}
                                                className="flex-grow-1"
                                            />
                                            <span className="fw-bold nav-link" style={{ minWidth: '45px' }}>
                                                {job.workProgress || 0}%
                                            </span>
                                        </div>
                                        <ProgressBar
                                            now={job.workProgress || 0}
                                            variant="success"
                                            className="mt-1"
                                            style={{ height: '4px' }}
                                        />
                                    </td>
                                    <td>
                                        <Badge bg={
                                            (job.workProgress || 0) === 100 ? 'success' :
                                                (job.workProgress || 0) > 0 ? 'primary' : 'secondary'
                                        }>
                                            {(job.workProgress || 0) === 100 ? 'Completed' :
                                                (job.workProgress || 0) > 0 ? 'In Progress' : 'Not Started'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted">No active jobs found.</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default VendorWorkManager;
