import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VendorBooking = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const eventId = new URLSearchParams(location.search).get('eventId');
    const { user } = useContext(AuthContext);
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [bookingData, setBookingData] = useState({
        serviceDate: '',
        numberOfGuests: '',
        venue: '',
        specialRequests: ''
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        console.log('VendorBooking - vendorId from URL params:', vendorId);
        fetchVendorDetails();
        // eslint-disable-next-line
    }, [vendorId]);

    const fetchVendorDetails = async () => {
        try {
            console.log('Fetching vendor details for ID:', vendorId);

            // FIXED: Use direct vendor profile lookup instead of advanced search
            // The advanced search endpoint doesn't support _id parameter filtering
            // So we fetch the vendor directly by their MongoDB _id
            const res = await axios.get(`http://localhost:5000/api/vendors/${vendorId}`);
            console.log('Vendor API response:', res.data);

            if (res.data) {
                setVendor(res.data);
                console.log('Vendor loaded successfully:', res.data.businessName || res.data.userDetails?.name);
            } else {
                console.warn('No vendor found with ID:', vendorId);
                toast.error(`Vendor not found (ID: ${vendorId})`);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vendor details:', err);
            toast.error('Failed to load vendor details. Please try again.');
            setLoading(false);
        }
    };

    const handlePackageSelect = (pkg) => {
        setSelectedPackage(pkg);
        setShowBookingModal(true);
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please login to book a vendor');
            navigate('/login');
            return;
        }

        setSubmitting(true);

        try {
            // Create booking on backend
            const res = await axios.post('http://localhost:5000/api/bookings/create', {
                eventId,
                vendorId: vendor._id,
                serviceDate: bookingData.serviceDate,
                selectedPackage: {
                    packageName: selectedPackage.packageName,
                    price: selectedPackage.price,
                    description: selectedPackage.description
                },
                numberOfGuests: parseInt(bookingData.numberOfGuests),
                venue: bookingData.venue,
                specialRequests: bookingData.specialRequests
            }, config);

            const { booking, razorpayOrder, budgetAlert } = res.data;

            // Show budget alert if present
            if (budgetAlert) {
                toast.error(budgetAlert.message, { duration: 6000 });
            }

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id',
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    order_id: razorpayOrder.orderId,
                    name: 'EventEmpire',
                    description: `Booking: ${vendor.serviceType} - ${selectedPackage.packageName}`,
                    image: '/logo.png',
                    handler: async function (response) {
                        try {
                            // Verify payment on backend
                            const verifyRes = await axios.post('/api/bookings/verify-payment', {
                                bookingId: booking._id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }, config);

                            if (verifyRes.data.success) {
                                toast.success('Booking confirmed! Payment successful');
                                navigate('/dashboard');
                            }
                        } catch (err) {
                            toast.error('Payment verification failed');
                            console.error(err);
                        }
                    },
                    prefill: {
                        name: user?.name || '',
                        email: user?.email || '',
                    },
                    theme: {
                        color: '#D4AF37'
                    },
                    modal: {
                        ondismiss: function () {
                            toast.error('Payment cancelled');
                            setSubmitting(false);
                        }
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
                setSubmitting(false);
                setShowBookingModal(false);
            };

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Booking failed. Please try again');
            setSubmitting(false);
        }
    };

    const handlePayLater = async () => {
        if (!user) {
            toast.error('Please login to book a vendor');
            navigate('/login');
            return;
        }

        setSubmitting(true);

        try {
            // Create booking on backend
            // The backend always creates the booking in 'pending' payment status
            // We just ignore the Razorpay order returned
            await axios.post('http://localhost:5000/api/bookings/create', {
                eventId,
                vendorId: vendor._id,
                serviceDate: bookingData.serviceDate,
                selectedPackage: {
                    packageName: selectedPackage.packageName,
                    price: selectedPackage.price,
                    description: selectedPackage.description
                },
                numberOfGuests: parseInt(bookingData.numberOfGuests),
                venue: bookingData.venue,
                specialRequests: bookingData.specialRequests
            }, config);

            setSubmitting(false);
            setShowBookingModal(false);
            toast.success('Booking confirmed! You can pay later from the Event Page.');
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Booking failed');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <div className="spinner-border text-warning" role="status"></div>
            </Container>
        );
    }

    if (!vendor) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="danger">Vendor not found</Alert>
                <Button onClick={() => navigate('/find-vendors')}>Back to Search</Button>
            </Container>
        );
    }

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                <Button variant="link" onClick={() => navigate('/find-vendors')} className="mb-4 ps-0">
                    <i className="bi bi-arrow-left me-2"></i> Back to Search
                </Button>

                <Row>
                    <Col lg={8}>
                        {/* Vendor Info */}
                        <Card className="mb-4 border-0 shadow-lg">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div>
                                        <h2 className="fw-bold mb-2" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>
                                            {vendor.businessName || vendor.userDetails?.name}
                                        </h2>
                                        <Badge bg="warning" text="dark" className="px-3 py-2">{vendor.serviceType}</Badge>
                                    </div>
                                    <div className="text-end">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-star-fill text-warning"></i>
                                            <span className="fw-bold">{vendor.averageRating?.toFixed(1) || 'New'}</span>
                                            <span className="text-muted">({vendor.totalReviews || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <p className="mb-2"><i className="bi bi-geo-alt me-2 text-warning"></i> {vendor.location?.city}, {vendor.location?.state}</p>
                                    <p className="mb-2"><i className="bi bi-clock me-2 text-warning"></i> Response Time: {vendor.responseTime || 'N/A'}</p>
                                    <p className="mb-0"><i className="bi bi-briefcase me-2 text-warning"></i> {vendor.yearsOfExperience || 0} years experience</p>
                                </div>

                                <hr />

                                <div>
                                    <h5 className="fw-bold mb-3">About</h5>
                                    <p className="text-secondary">{vendor.description || 'No description available.'}</p>
                                </div>
                            </Card.Body>
                        </Card>

                        {/* Packages */}
                        <h4 className="fw-bold mb-3">Available Packages</h4>
                        <Row>
                            {vendor.pricingTiers?.map((pkg, idx) => (
                                <Col md={4} key={idx} className="mb-3">
                                    <Card className="h-100 border-0 shadow hover-shadow" style={{ transition: 'all 0.3s' }}>
                                        <Card.Body className="d-flex flex-column">
                                            <div className="text-center mb-3">
                                                <h5 className="fw-bold text-uppercase">{pkg.packageName}</h5>
                                                <h3 className="text-warning fw-bold">₹{pkg.price.toLocaleString()}</h3>
                                                <small className="text-muted">{pkg.currency}</small>
                                            </div>

                                            <p className="text-secondary small mb-3">{pkg.description}</p>

                                            <div className="mb-3 flex-grow-1">
                                                <strong className="small text-muted">Inclusions:</strong>
                                                <ul className="small mt-2">
                                                    {pkg.inclusions?.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <Button
                                                className="btn-royal-gold w-100"
                                                onClick={() => handlePackageSelect(pkg)}
                                            >
                                                Book Now
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>

                    <Col lg={4}>
                        {/* Quick Info Card */}
                        <Card className="border-0 shadow sticky-top" style={{ top: '20px' }}>
                            <Card.Body className="p-4">
                                <h5 className="fw-bold mb-3">Quick Info</h5>
                                <div className="mb-3">
                                    <strong className="d-block mb-2">Contact</strong>
                                    <p className="mb-1"><i className="bi bi-telephone me-2"></i> {vendor.contactPhone || 'Not provided'}</p>
                                    <p className="mb-0"><i className="bi bi-envelope me-2"></i> {vendor.user?.email || vendor.userDetails?.email || 'Not provided'}</p>
                                </div>

                                <hr />

                                <Button
                                    variant="outline-warning"
                                    className="w-100 mb-2"
                                    onClick={() => {
                                        const targetId = vendor.user?._id || vendor.user;
                                        if (typeof targetId === 'object') {
                                            // Fallback if _id is also an object (rare but possible with some drivers)
                                            navigate(`/messages?chatWith=${targetId.toString()}`);
                                        } else {
                                            navigate(`/messages?chatWith=${targetId}`);
                                        }
                                    }}
                                >
                                    <i className="bi bi-chat me-2"></i> Message Vendor
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Booking Modal */}
                <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Complete Your Booking</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedPackage && (
                            <Alert variant="info" className="mb-4">
                                <strong>Package:</strong> {selectedPackage.packageName} - ₹{selectedPackage.price.toLocaleString()}
                            </Alert>
                        )}

                        <Form onSubmit={handleBookingSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Service Date *</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={bookingData.serviceDate}
                                            onChange={(e) => setBookingData({ ...bookingData, serviceDate: e.target.value })}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold">Number of Guests *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="e.g. 100"
                                            value={bookingData.numberOfGuests}
                                            onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: e.target.value })}
                                            required
                                            min="1"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Venue Address *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter full venue address"
                                    value={bookingData.venue}
                                    onChange={(e) => setBookingData({ ...bookingData, venue: e.target.value })}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold">Special Requests (Optional)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Any specific requirements or requests..."
                                    value={bookingData.specialRequests}
                                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                                />
                            </Form.Group>

                            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                                <Button variant="secondary" onClick={() => setShowBookingModal(false)} disabled={submitting}>
                                    Cancel
                                </Button>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="outline-primary"
                                        onClick={handlePayLater}
                                        disabled={submitting}
                                    >
                                        <i className="bi bi-clock-history me-2"></i>
                                        Book & Pay Later
                                    </Button>
                                    <Button type="submit" className="btn-royal-gold" disabled={submitting}>
                                        {submitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-credit-card me-2"></i>
                                                Pay Now
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default VendorBooking;
