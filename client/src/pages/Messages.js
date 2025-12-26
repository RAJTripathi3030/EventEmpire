import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const chatWithId = searchParams.get('chatWith');
        if (chatWithId) {
            const existingConversation = conversations.find(c => c._id === chatWithId);
            if (existingConversation) {
                setCurrentChat(existingConversation);
            } else {
                fetchUserDetails(chatWithId);
            }
        }
    }, [searchParams, conversations]);

    useEffect(() => {
        if (currentChat) {
            fetchMessages(currentChat._id);
            const interval = setInterval(() => fetchMessages(currentChat._id), 5000);
            return () => clearInterval(interval);
        }
    }, [currentChat]);

    const fetchUserDetails = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/auth/${userId}`);
            setCurrentChat(res.data);
        } catch (err) {
            console.error(err);
            // Fallback if fetch fails, though unlikely with valid ID
            setCurrentChat({ _id: userId, name: 'Unknown User' });
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/messages/conversations', config);
            setConversations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/${userId}`, config);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteConversation = async () => {
        setShowDeleteModal(false);
        const deletePromise = axios.delete(`http://localhost:5000/api/messages/conversations/${currentChat._id}`, config);

        toast.promise(
            deletePromise,
            {
                loading: 'Deleting conversation...',
                success: () => {
                    setConversations(conversations.filter(c => c._id !== currentChat._id));
                    setCurrentChat(null);
                    setMessages([]);
                    return 'Conversation deleted successfully!';
                },
                error: (err) => {
                    if (err.response) {
                        return err.response.data?.error || err.response.data?.message || 'Failed to delete conversation';
                    } else if (err.request) {
                        return 'Network error. Please check your connection.';
                    } else {
                        return `Error: ${err.message}`;
                    }
                }
            }
        );
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentChat) return;

        try {
            const res = await axios.post('http://localhost:5000/api/messages', {
                receiverId: currentChat._id,
                content: newMessage
            }, config);
            setMessages([...messages, res.data]);
            setNewMessage('');
            if (!conversations.find(c => c._id === currentChat._id)) {
                fetchConversations();
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to send message');
        }
    };

    return (
        <Container className="mt-4" style={{ height: '80vh' }}>
            <div className="glass-card h-100 p-0 overflow-hidden d-flex bg-white shadow-lg border-0">
                <Row className="h-100 g-0 w-100">
                    <Col md={4} className="border-end border-light bg-light">
                        <div className="p-3 border-bottom border-light">
                            <h4 className="fw-bold m-0" style={{ color: 'var(--royal-accent)', fontFamily: 'Playfair Display' }}>Conversations</h4>
                        </div>
                        <ListGroup variant="flush" className="bg-transparent overflow-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
                            {conversations.length > 0 ? (
                                conversations.map((c) => (
                                    <ListGroup.Item
                                        key={c._id}
                                        action
                                        active={currentChat?._id === c._id}
                                        onClick={() => setCurrentChat(c)}
                                        className={`bg-transparent text-dark border-bottom border-light ${currentChat?._id === c._id ? 'bg-white shadow-sm' : ''}`}
                                        style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                                                <i className="bi bi-person-fill text-dark"></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold">{c.name}</div>
                                                <div className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>Select to chat</div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <div className="p-4 text-center text-muted">No conversations yet</div>
                            )}
                        </ListGroup>
                    </Col>
                    <Col md={8} className="d-flex flex-column h-100 bg-white">
                        {currentChat ? (
                            <>
                                <div className="p-3 border-bottom border-light d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
                                    <h5 className="m-0 text-dark fw-bold" style={{ fontFamily: 'Playfair Display' }}>{currentChat.name}</h5>
                                    <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteModal(true)} className="border-0">
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                                <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-2" style={{ backgroundColor: '#fffcf5' }}>
                                    {messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`d-flex ${msg.sender === user._id ? 'justify-content-end' : 'justify-content-start'}`}
                                        >
                                            <div
                                                className={`p-3 rounded-3 shadow-sm ${msg.sender === user._id ? 'btn-royal-gold text-dark' : 'bg-white border text-dark'}`}
                                                style={{ maxWidth: '70%', wordWrap: 'break-word' }}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-top border-light" style={{ backgroundColor: '#f8f9fa' }}>
                                    <Form onSubmit={handleSendMessage} className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="form-control-glass border shadow-sm bg-white text-dark"
                                        />
                                        <Button type="submit" className="btn-royal-gold shadow-sm">
                                            <i className="bi bi-send-fill"></i>
                                        </Button>
                                    </Form>
                                </div>
                            </>
                        ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">
                                <i className="bi bi-chat-square-text display-1 mb-3"></i>
                                <h4>Select a conversation to start messaging</h4>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Playfair Display' }}>
                        Delete Conversation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <i className="bi bi-exclamation-triangle text-warning display-1 mb-3"></i>
                    <p className="mb-0">Are you sure you want to delete this conversation with <strong>{currentChat?.name}</strong>?</p>
                    <p className="text-muted small mt-2">This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteConversation}>
                        <i className="bi bi-trash me-2"></i>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Messages;
