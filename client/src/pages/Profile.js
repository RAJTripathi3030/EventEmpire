import React, { useState, useContext, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setPhone(user.phone || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', { name, phone }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateUser(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'danger', text: 'Failed to update profile.' });
        }
    };

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container style={{ maxWidth: '600px' }}>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible className="glass-card border-0 mb-4 shadow-sm">
                        {message.text}
                    </Alert>
                )}
                <div className="glass-card p-4 p-md-5 bg-white shadow-lg border-0">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold display-6" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>Edit Profile</h2>
                        <p className="text-secondary">Update your personal information</p>
                    </div>

                    <Form onSubmit={handleUpdateProfile}>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted fw-bold small">Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="form-control-glass bg-light"
                                placeholder="Enter your name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted fw-bold small">Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                disabled
                                className="form-control-glass bg-light"
                                style={{ opacity: 0.8 }}
                            />
                            <Form.Text className="text-muted small">
                                Email address cannot be changed for security reasons.
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-muted fw-bold small">Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="form-control-glass bg-light"
                                placeholder="Enter your phone number"
                            />
                        </Form.Group>
                        <div className="d-grid mt-5">
                            <Button type="submit" className="btn-royal-gold py-2 fs-5 shadow-sm">
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                </div>
            </Container>
        </div>
    );
};

export default Profile;
