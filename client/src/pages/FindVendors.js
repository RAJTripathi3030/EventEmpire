import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Button, Form, Modal, Image, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FindVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [filters, setFilters] = useState({ location: '', serviceType: '' });
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalVendors, setTotalVendors] = useState(0);
    const [dateFilter, setDateFilter] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const eventId = new URLSearchParams(location.search).get('eventId');

    useEffect(() => {
        fetchVendors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, dateFilter]);

    const fetchVendors = async () => {
        try {
            const params = new URLSearchParams({
                ...filters,
                page: currentPage,
                limit: 10,
                date: dateFilter
            }).toString();
            const res = await axios.get(`http://localhost:5000/api/vendors/search?${params}`);
            setVendors(res.data.vendors || []);
            setTotalPages(res.data.totalPages || 1);
            setTotalVendors(res.data.totalVendors || 0);
            setCurrentPage(res.data.currentPage || 1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVendors();
    };

    const handleViewProfile = (vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
    };

    const handleMessage = (vendorId) => {
        navigate(`/messages?chatWith=${vendorId}`);
    };

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold display-4" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>Find Your Dream Team</h2>
                    <p className="text-secondary fs-5">Discover the best vendors to make your event unforgettable.</p>
                </div>

                <div className="glass-card mb-5 p-4 bg-white shadow-sm border-0">
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3">
                            <Col md={5}>
                                <Form.Control
                                    type="text"
                                    placeholder="Location (e.g. Mumbai)"
                                    value={filters.location}
                                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    className="form-control-glass bg-light"
                                />
                            </Col>
                            <Col md={5}>
                                <Form.Select
                                    value={filters.serviceType}
                                    onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                                    className="form-control-glass bg-light"
                                >
                                    <option value="">All Service Types</option>
                                    <option value="Catering">Catering</option>
                                    <option value="Photography">Photography</option>
                                    <option value="DJ">DJ / Music</option>
                                    <option value="Venue">Venue</option>
                                    <option value="Decor">Decoration</option>
                                    <option value="Planning">Event Planning</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Button type="submit" className="w-100 h-100 btn-royal-gold shadow-sm">Search</Button>
                            </Col>
                            <Col md={12} className="mt-3">
                                <Form.Control
                                    type="date"
                                    placeholder="Filter by event date"
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="form-control-glass bg-light"
                                />
                                <Form.Text className="text-muted">
                                    Show only vendors available on this date
                                </Form.Text>
                            </Col>
                        </Row>
                    </Form>
                </div>

                <Row xs={1} md={2} lg={3} className="g-4">
                    {vendors.map((vendor) => (
                        <Col key={vendor._id}>
                            <div className="glass-card h-100 d-flex flex-column bg-white shadow-lg border-0 scale-hover" style={{ transition: 'transform 0.3s' }}>
                                <div className="p-4 flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <h4 className="fw-bold mb-0 text-truncate text-dark" style={{ flex: 1, fontFamily: 'Playfair Display' }}>{vendor.businessName || vendor.user?.name}</h4>
                                        <Badge bg="warning" text="dark" pill className="px-3 py-2">{vendor.serviceType}</Badge>
                                    </div>
                                    <div className="mb-3">
                                        <p className="mb-2 text-muted"><i className="bi bi-geo-alt me-2 text-warning"></i> {vendor.location?.city || vendor.location?.address || 'N/A'}</p>
                                        <p className="mb-2 text-dark fw-medium"><i className="bi bi-tag me-2 text-warning"></i> {vendor.pricingTiers?.[0] ? `From ₹${vendor.pricingTiers[0].price}` : 'Contact for pricing'}</p>
                                        {vendor.description && (
                                            <p className="text-secondary small text-truncate mt-3 border-top pt-2">{vendor.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="p-3 bg-light border-top">
                                    <Button
                                        className="w-100 btn-royal-gold shadow-sm"
                                        onClick={() => {
                                            console.log('Navigating to vendor booking - Vendor ID:', vendor._id, 'Vendor Name:', vendor.businessName || vendor.user?.name);
                                            navigate(`/vendor/${vendor._id}/book${eventId ? `?eventId=${eventId}` : ''}`);
                                        }}
                                    >
                                        Book This Vendor
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    ))}
                    {vendors.length === 0 && (
                        <Col className="w-100">
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-search display-3 mb-3 d-block opacity-25"></i>
                                <p className="lead">No vendors found matching your criteria.</p>
                            </div>
                        </Col>
                    )}
                </Row>

                {/* Pagination Controls */}
                {vendors.length > 0 && (
                    <div className="d-flex justify-content-between align-items-center mt-5 p-4 glass-card bg-white">
                        <p className="text-muted mb-0">
                            Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalVendors)} of {totalVendors} vendors
                        </p>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="btn-glass"
                            >
                                <i className="bi bi-chevron-left"></i> Previous
                            </Button>
                            <span className="align-self-center px-3 fw-bold">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline-secondary"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="btn-glass"
                            >
                                Next <i className="bi bi-chevron-right"></i>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Vendor Details Modal */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="border-0 shadow-lg">
                    <Modal.Header closeButton className="bg-light border-0">
                        <Modal.Title className="text-dark fw-bold" style={{ fontFamily: 'Playfair Display' }}>{selectedVendor?.businessName || selectedVendor?.user?.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-white text-dark">
                        <Row>
                            <Col md={6}>
                                <h5 className="mb-3" style={{ color: 'var(--gold-primary)' }}>Details</h5>
                                <div className="p-3 bg-light rounded mb-3">
                                    <p className="mb-2"><strong>Service:</strong> {selectedVendor?.serviceType}</p>
                                    <p className="mb-2"><strong>Email:</strong> {selectedVendor?.email || 'Not provided'}</p>
                                    <p className="mb-2"><strong>Location:</strong> {selectedVendor?.location?.city ? `${selectedVendor.location.city}, ${selectedVendor.location.state}` : 'N/A'}</p>
                                    <p className="mb-0"><strong>Pricing:</strong> {selectedVendor?.pricingTiers?.[0] ? `From ₹${selectedVendor.pricingTiers[0].price}/${selectedVendor.pricingTiers[0].packageName}` : 'Contact for pricing'}</p>
                                </div>
                                <h5 className="mb-2" style={{ color: 'var(--gold-primary)' }}>Description</h5>
                                <p className="text-secondary">{selectedVendor?.description || 'No description available.'}</p>
                            </Col>
                            <Col md={6}>
                                <h5 className="mb-3" style={{ color: 'var(--gold-primary)' }}>Portfolio</h5>
                                <div className="p-2 bg-light rounded">
                                    <Row xs={2} className="g-2">
                                        {selectedVendor?.portfolio?.length > 0 ? (
                                            selectedVendor.portfolio.map((img, idx) => (
                                                <Col key={idx}>
                                                    <Image src={img} rounded className="shadow-sm border" style={{ height: '100px', objectFit: 'cover', width: '100%' }} />
                                                </Col>
                                            ))
                                        ) : (
                                            <Col className="text-center py-4">
                                                <p className="text-muted small">No images available.</p>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0 bg-light">
                        <Button variant="link" className="text-secondary text-decoration-none" onClick={() => setShowModal(false)}>
                            Close
                        </Button>
                        <Button className="btn-royal-gold" onClick={() => {
                            const userField = selectedVendor?.user;
                            let vendorUserId = null;

                            console.log('=== Contact Vendor Debug ===');
                            console.log('User field:', userField);
                            console.log('User field type:', typeof userField);

                            // Extract ID from various formats
                            if (typeof userField === 'string' && /^[0-9a-fA-F]{24}$/.test(userField)) {
                                // Already a valid string ID
                                vendorUserId = userField;
                            } else if (userField && typeof userField === 'object') {
                                // Inspect the object to find the ID
                                console.log('User field keys:', Object.keys(userField));
                                console.log('User field._id:', userField._id);
                                console.log('User field._id type:', typeof userField._id);

                                // Try to get _id as string
                                const idField = userField._id;
                                if (typeof idField === 'string') {
                                    vendorUserId = idField;
                                } else if (idField && typeof idField === 'object') {
                                    // ObjectId might have special properties
                                    console.log('_id object keys:', Object.keys(idField));
                                    // Try common ObjectId properties
                                    if (idField.id) vendorUserId = idField.id;
                                    else if (idField.$oid) vendorUserId = idField.$oid;
                                    // Last resort: try to extract from JSON
                                    else {
                                        try {
                                            const jsonStr = JSON.stringify(idField);
                                            console.log('_id as JSON:', jsonStr);
                                        } catch (e) {
                                            console.error('Cannot stringify _id');
                                        }
                                    }
                                }
                            }

                            console.log('Final extracted ID:', vendorUserId);
                            console.log('=== End Debug ===');

                            if (vendorUserId && /^[0-9a-fA-F]{24}$/.test(vendorUserId)) {
                                handleMessage(vendorUserId);
                            } else {
                                alert('Unable to message this vendor. Please check the console for details.');
                            }
                        }}>
                            Contact Vendor
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default FindVendors;
