import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VendorRegistration = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [existingProfile, setExistingProfile] = useState(null);

    // Form state with all vendor details
    const [formData, setFormData] = useState({
        businessName: '',
        serviceType: '',
        description: '',
        contactPhone: '',
        yearsOfExperience: '',
        location: {
            address: '',
            city: '',
            state: '',
            pincode: ''
        },
        pricingTiers: [
            {
                packageName: 'Basic',
                price: '',
                currency: 'INR',
                description: '',
                inclusions: ['']
            }
        ],
        portfolio: ['']
    });

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Check if vendor already has a profile
    useEffect(() => {
        const checkExistingProfile = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/vendors/profile', config);
                if (res.data) {
                    setExistingProfile(res.data);
                    toast.info('You already have a vendor profile. You can update it here.');
                    // Pre-fill form with existing data
                    setFormData({
                        businessName: res.data.businessName || '',
                        serviceType: res.data.serviceType || '',
                        description: res.data.description || '',
                        contactPhone: res.data.contactPhone || '',
                        yearsOfExperience: res.data.yearsOfExperience || '',
                        location: res.data.location || {
                            address: '',
                            city: '',
                            state: '',
                            pincode: ''
                        },
                        pricingTiers: res.data.pricingTiers?.length > 0 ? res.data.pricingTiers : [
                            {
                                packageName: 'Basic',
                                price: '',
                                currency: 'INR',
                                description: '',
                                inclusions: ['']
                            }
                        ],
                        portfolio: res.data.portfolio?.length > 0 ? res.data.portfolio : ['']
                    });
                }
            } catch (err) {
                console.log('No existing profile found, creating new one');
            }
        };
        checkExistingProfile();
        // eslint-disable-next-line
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            location: { ...formData.location, [name]: value }
        });
    };

    const handlePricingChange = (index, field, value) => {
        const updatedTiers = [...formData.pricingTiers];
        updatedTiers[index][field] = value;
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const handleInclusionChange = (tierIndex, inclusionIndex, value) => {
        const updatedTiers = [...formData.pricingTiers];
        updatedTiers[tierIndex].inclusions[inclusionIndex] = value;
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const addInclusion = (tierIndex) => {
        const updatedTiers = [...formData.pricingTiers];
        updatedTiers[tierIndex].inclusions.push('');
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const removeInclusion = (tierIndex, inclusionIndex) => {
        const updatedTiers = [...formData.pricingTiers];
        updatedTiers[tierIndex].inclusions.splice(inclusionIndex, 1);
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const addPricingTier = () => {
        setFormData({
            ...formData,
            pricingTiers: [
                ...formData.pricingTiers,
                {
                    packageName: '',
                    price: '',
                    currency: 'INR',
                    description: '',
                    inclusions: ['']
                }
            ]
        });
    };

    const removePricingTier = (index) => {
        const updatedTiers = formData.pricingTiers.filter((_, i) => i !== index);
        setFormData({ ...formData, pricingTiers: updatedTiers });
    };

    const handlePortfolioChange = (index, value) => {
        const updatedPortfolio = [...formData.portfolio];
        updatedPortfolio[index] = value;
        setFormData({ ...formData, portfolio: updatedPortfolio });
    };

    const addPortfolioImage = () => {
        setFormData({ ...formData, portfolio: [...formData.portfolio, ''] });
    };

    const removePortfolioImage = (index) => {
        const updatedPortfolio = formData.portfolio.filter((_, i) => i !== index);
        setFormData({ ...formData, portfolio: updatedPortfolio });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Clean up data before submission
            const cleanedData = {
                ...formData,
                yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
                pricingTiers: formData.pricingTiers.map(tier => ({
                    ...tier,
                    price: parseFloat(tier.price) || 0,
                    inclusions: tier.inclusions.filter(inc => inc.trim() !== '')
                })),
                portfolio: formData.portfolio.filter(url => url.trim() !== '')
            };

            console.log('Submitting vendor registration:', cleanedData);

            const res = await axios.post('http://localhost:5000/api/vendors/profile', cleanedData, config);

            console.log('Vendor registration response:', res.data);
            toast.success(existingProfile ? 'Vendor profile updated successfully!' : 'Vendor profile created successfully!');

            // Navigate to vendor dashboard
            setTimeout(() => {
                navigate('/vendor-dashboard');
            }, 1500);
        } catch (err) {
            console.error('Error submitting vendor registration:', err);
            toast.error(err.response?.data?.message || 'Failed to save vendor profile. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                <div className="mb-4">
                    <Button variant="link" onClick={() => navigate('/vendor-dashboard')} className="ps-0 text-decoration-none">
                        <i className="bi bi-arrow-left me-2"></i> Back to Dashboard
                    </Button>
                </div>

                <Card className="border-0 shadow-lg">
                    <Card.Body className="p-4 p-md-5">
                        <div className="text-center mb-5">
                            <h2 className="display-5 fw-bold" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>
                                {existingProfile ? 'Update Your Vendor Profile' : 'Complete Your Vendor Profile'}
                            </h2>
                            <p className="text-secondary fs-5">
                                Fill in your business details to start receiving bookings from clients
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            {/* Basic Information */}
                            <div className="mb-5">
                                <h4 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-building me-2"></i> Basic Information
                                </h4>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Business Name *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="businessName"
                                                value={formData.businessName}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Royal Events & Catering"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Service Type *</Form.Label>
                                            <Form.Select
                                                name="serviceType"
                                                value={formData.serviceType}
                                                onChange={handleInputChange}
                                                required
                                                className="form-control-glass bg-light"
                                            >
                                                <option value="">Select Service Type</option>
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
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Contact Phone *</Form.Label>
                                            <Form.Control
                                                type="tel"
                                                name="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={handleInputChange}
                                                placeholder="+91 98765 43210"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Years of Experience *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="yearsOfExperience"
                                                value={formData.yearsOfExperience}
                                                onChange={handleInputChange}
                                                placeholder="e.g., 5"
                                                min="0"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Business Description *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe your services, specialties, and what makes your business unique..."
                                        required
                                        className="form-control-glass bg-light"
                                    />
                                </Form.Group>
                            </div>

                            {/* Location Information */}
                            <div className="mb-5">
                                <h4 className="fw-bold mb-4 pb-2 border-bottom" style={{ color: 'var(--gold-primary)' }}>
                                    <i className="bi bi-geo-alt me-2"></i> Location
                                </h4>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Address *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={formData.location.address}
                                                onChange={handleLocationChange}
                                                placeholder="Street address"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">City *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={formData.location.city}
                                                onChange={handleLocationChange}
                                                placeholder="e.g., Mumbai"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">State *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="state"
                                                value={formData.location.state}
                                                onChange={handleLocationChange}
                                                placeholder="e.g., Maharashtra"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold">Pincode *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="pincode"
                                                value={formData.location.pincode}
                                                onChange={handleLocationChange}
                                                placeholder="e.g., 400001"
                                                required
                                                className="form-control-glass bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </div>

                            {/* Pricing Tiers */}
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                    <h4 className="fw-bold mb-0" style={{ color: 'var(--gold-primary)' }}>
                                        <i className="bi bi-tag me-2"></i> Pricing Packages
                                    </h4>
                                    <Button variant="outline-warning" size="sm" onClick={addPricingTier}>
                                        <i className="bi bi-plus-circle me-1"></i> Add Package
                                    </Button>
                                </div>

                                {formData.pricingTiers.map((tier, tierIndex) => (
                                    <Card key={tierIndex} className="mb-4 border-warning">
                                        <Card.Body className="bg-light">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <Badge bg="warning" text="dark" className="px-3 py-2">
                                                    Package {tierIndex + 1}
                                                </Badge>
                                                {formData.pricingTiers.length > 1 && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removePricingTier(tierIndex)}
                                                    >
                                                        <i className="bi bi-trash"></i> Remove
                                                    </Button>
                                                )}
                                            </div>

                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold small">Package Name *</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={tier.packageName}
                                                            onChange={(e) => handlePricingChange(tierIndex, 'packageName', e.target.value)}
                                                            placeholder="e.g., Basic, Premium, Deluxe"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-bold small">Price (₹) *</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            value={tier.price}
                                                            onChange={(e) => handlePricingChange(tierIndex, 'price', e.target.value)}
                                                            placeholder="e.g., 50000"
                                                            min="0"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold small">Package Description *</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={tier.description}
                                                    onChange={(e) => handlePricingChange(tierIndex, 'description', e.target.value)}
                                                    placeholder="Describe what's included in this package..."
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Label className="fw-bold small">Inclusions</Form.Label>
                                            {tier.inclusions.map((inclusion, inclusionIndex) => (
                                                <div key={inclusionIndex} className="d-flex gap-2 mb-2">
                                                    <Form.Control
                                                        type="text"
                                                        value={inclusion}
                                                        onChange={(e) => handleInclusionChange(tierIndex, inclusionIndex, e.target.value)}
                                                        placeholder="e.g., 2 photographers, 500 edited photos"
                                                    />
                                                    {tier.inclusions.length > 1 && (
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => removeInclusion(tierIndex, inclusionIndex)}
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline-secondary"
                                                size="sm"
                                                onClick={() => addInclusion(tierIndex)}
                                                className="mt-2"
                                            >
                                                <i className="bi bi-plus me-1"></i> Add Inclusion
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>

                            {/* Portfolio */}
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                                    <h4 className="fw-bold mb-0" style={{ color: 'var(--gold-primary)' }}>
                                        <i className="bi bi-images me-2"></i> Portfolio (Optional)
                                    </h4>
                                    <Button variant="outline-warning" size="sm" onClick={addPortfolioImage}>
                                        <i className="bi bi-plus-circle me-1"></i> Add Image
                                    </Button>
                                </div>

                                <Alert variant="info" className="mb-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Add image URLs to showcase your previous work. You can use image hosting services like Imgur, Cloudinary, or direct URLs.
                                </Alert>

                                {formData.portfolio.map((url, index) => (
                                    <div key={index} className="d-flex gap-2 mb-3">
                                        <Form.Control
                                            type="url"
                                            value={url}
                                            onChange={(e) => handlePortfolioChange(index, e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        {formData.portfolio.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => removePortfolioImage(index)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <div className="text-center pt-4 border-top">
                                <Button
                                    type="submit"
                                    className="btn-royal-gold px-5 py-3 fs-5"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle me-2"></i>
                                            {existingProfile ? 'Update Profile' : 'Complete Registration'}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default VendorRegistration;
