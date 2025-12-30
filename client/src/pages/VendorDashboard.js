import React, { useEffect, useState, useContext } from 'react';
import { Container, Form, Button, Row, Col, Alert, Tab, Nav, Card, Modal, Image, Badge } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Messages from './Messages';
import VendorPaymentHistory from '../components/VendorPaymentHistory';
import VendorWorkManager from '../components/VendorWorkManager';

const VendorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: '',
        location: '',
        pricing: '',
        description: '',
    });
    const [message, setMessage] = useState(null);
    const [newImage, setNewImage] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/vendors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            if (res.data) {
                setFormData({
                    serviceType: res.data.serviceType || '',
                    location: res.data.location || '',
                    pricing: res.data.pricing || '',
                    description: res.data.description || '',
                });
            }
        } catch (err) {
            console.log('No profile found');
        }
    };

    const handleSave = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/vendors/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile saved successfully' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error saving profile' });
        }
    };

    const handleAddImage = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/vendors/portfolio', { imageUrl: newImage }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
            setNewImage('');
            setShowImageModal(false);
            setMessage({ type: 'success', text: 'Image added to portfolio' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'danger', text: 'Error adding image' });
        }
    };

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                <div className="mb-5 border-bottom border-warning pb-3">
                    <h2 className="display-5 fw-bold" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>
                        Vendor Dashboard
                    </h2>
                    <p className="text-secondary">Manage your profile, portfolio, and view client inquiries.</p>
                </div>

                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="glass-card border-0 mb-4 shadow-sm">
                        {message.text}
                    </Alert>
                )}

                <Tab.Container defaultActiveKey="profile">
                    <Nav variant="pills" className="mb-4 glass-nav p-2 rounded justify-content-center bg-white shadow-sm">
                        <Nav.Item>
                            <Nav.Link eventKey="profile" className="text-dark fw-bold mx-2">Profile</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="inquiries" className="text-dark fw-bold mx-2">Inquiries</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="portfolio" className="text-dark fw-bold mx-2">Portfolio</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="payments" className="text-dark fw-bold mx-2">Payments & Work</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Tab.Content>
                        <Tab.Pane eventKey="profile">
                            <Row>
                                <Col md={10} className="mx-auto">
                                    <div className="glass-card p-4 bg-white text-dark shadow-lg">
                                        {!profile && !isEditing && (
                                            <Alert variant="warning" className="border-warning text-dark bg-light mb-4">
                                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                                                    <div>
                                                        <h5 className="mb-2"><i className="bi bi-exclamation-triangle me-2"></i>Profile Incomplete</h5>
                                                        <p className="mb-0">Complete your vendor profile to start receiving bookings from clients!</p>
                                                    </div>
                                                    <Button
                                                        className="btn-royal-gold"
                                                        onClick={() => window.location.href = '/vendor-registration'}
                                                    >
                                                        <i className="bi bi-pencil-square me-2"></i>
                                                        Complete Profile
                                                    </Button>
                                                </div>
                                            </Alert>
                                        )}

                                        {isEditing ? (
                                            <Form>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted">Service Type</Form.Label>
                                                    <Form.Select
                                                        value={formData.serviceType}
                                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                                        className="form-control-glass bg-light"
                                                    >
                                                        <option value="">Select Service Type</option>
                                                        <option value="Catering">Catering</option>
                                                        <option value="Photography">Photography</option>
                                                        <option value="Venue">Venue</option>
                                                        <option value="Decor">Decor</option>
                                                        <option value="Music">Music</option>
                                                        <option value="Other">Other</option>
                                                    </Form.Select>
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted">Location</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        className="form-control-glass bg-light"
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted">Pricing</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formData.pricing}
                                                        onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                                                        placeholder="e.g. Starts at ₹50,000"
                                                        className="form-control-glass bg-light"
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-3">
                                                    <Form.Label className="fw-bold small text-muted">Description</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={3}
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        placeholder="Describe your services, package details, etc."
                                                        className="form-control-glass bg-light"
                                                    />
                                                </Form.Group>
                                                <div className="d-flex gap-2">
                                                    <Button className="btn-royal-gold" onClick={handleSave}>
                                                        Save Profile
                                                    </Button>
                                                    <Button variant="outline-dark" onClick={() => setIsEditing(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </Form>
                                        ) : (
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start mb-4">
                                                    <h3 style={{ color: 'var(--gold-primary)' }} className="fw-bold">Business Profile</h3>
                                                    <Button
                                                        className="btn-royal-gold"
                                                        onClick={() => window.location.href = '/vendor-registration'}
                                                    >
                                                        <i className="bi bi-pencil me-2"></i> Edit Profile
                                                    </Button>
                                                </div>
                                                <Row className="gy-4">
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Business Name</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">{profile?.businessName || 'N/A'}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Service Type</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">{profile?.serviceType || 'N/A'}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Email</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">{profile?.email || 'N/A'}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Contact Phone</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">{profile?.contactPhone || 'N/A'}</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Location</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">
                                                                {profile?.location?.city && profile?.location?.state
                                                                    ? `${profile.location.city}, ${profile.location.state}`
                                                                    : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Experience</p>
                                                            <p className="fs-5 fw-bold text-dark mb-0">
                                                                {profile?.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </Col>
                                                    <Col md={12}>
                                                        <div className="p-3 rounded bg-light border-start border-4 border-warning">
                                                            <p className="mb-1 text-muted small fw-bold text-uppercase">Pricing Packages</p>
                                                            {profile?.pricingTiers?.length > 0 ? (
                                                                <div className="d-flex flex-wrap gap-2 mt-2">
                                                                    {profile.pricingTiers.map((tier, idx) => (
                                                                        <Badge key={idx} bg="warning" text="dark" className="px-3 py-2">
                                                                            {tier.packageName}: ₹{tier.price}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="fs-5 fw-bold text-dark mb-0">N/A</p>
                                                            )}
                                                        </div>
                                                    </Col>
                                                    <Col md={12}>
                                                        <div className="mt-2">
                                                            <p className="mb-2 text-warning fw-bold"><i className="bi bi-file-text me-2"></i> Description</p>
                                                            <p className="fs-5 text-secondary">{profile?.description || 'N/A'}</p>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Tab.Pane>

                        <Tab.Pane eventKey="inquiries">
                            <div className="glass-card p-4 bg-white shadow-lg">
                                <Messages />
                            </div>
                        </Tab.Pane>

                        <Tab.Pane eventKey="portfolio">
                            <div className="d-flex justify-content-between align-items-center mb-4 text-dark">
                                <h3 className="fw-bold" style={{ color: 'var(--royal-accent)' }}>My Portfolio</h3>
                                <Button className="btn-royal-gold" onClick={() => setShowImageModal(true)}>
                                    <i className="bi bi-plus-lg me-2"></i> Add Image
                                </Button>
                            </div>
                            <Row xs={1} md={3} className="g-4">
                                {profile?.portfolio?.map((img, idx) => (
                                    <Col key={idx}>
                                        <div className="glass-card p-2 h-100 bg-white shadow-sm group-hover-zoom overflow-hidden">
                                            <div className="overflow-hidden rounded">
                                                <Image src={img} fluid className="w-100" style={{ height: '250px', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            {(!profile?.portfolio || profile.portfolio.length === 0) && (
                                <div className="text-center text-muted mt-5">
                                    <i className="bi bi-images display-1 d-block mb-3 opacity-25"></i>
                                    <p className="lead">No images in portfolio yet. Add some to showcase your work!</p>
                                </div>
                            )}
                        </Tab.Pane>

                        <Tab.Pane eventKey="payments">
                            <VendorPaymentHistory />
                            <VendorWorkManager />
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>

                {/* Add Image Modal */}
                <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="fw-bold text-dark">Add Portfolio Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white">
                        <Form.Group>
                            <Form.Label className="fw-bold small text-muted">Image URL</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="https://example.com/image.jpg"
                                value={newImage}
                                onChange={(e) => setNewImage(e.target.value)}
                                className="form-control-glass bg-light"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-muted text-decoration-none" onClick={() => setShowImageModal(false)}>Cancel</Button>
                        <Button className="btn-royal-gold" onClick={handleAddImage}>Add</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default VendorDashboard;
