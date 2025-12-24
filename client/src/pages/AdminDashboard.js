import React, { useEffect, useState, useContext } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        };
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
        }
    };

    return (
        <div className="py-5" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            <Container>
                <div className="glass-card p-4 bg-white shadow-lg border-0">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary">
                        <h2 className="fw-bold m-0" style={{ fontFamily: 'Playfair Display', color: 'var(--royal-accent)' }}>Admin Dashboard</h2>
                        <Button variant="outline-danger" onClick={logout} className="d-flex align-items-center gap-2 border-0 bg-light">
                            <i className="bi bi-box-arrow-right"></i> Logout
                        </Button>
                    </div>

                    <div className="table-responsive">
                        <Table hover className="text-dark align-middle mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 text-muted small fw-bold text-uppercase">Name</th>
                                    <th className="border-0 text-muted small fw-bold text-uppercase">Email</th>
                                    <th className="border-0 text-muted small fw-bold text-uppercase">Role</th>
                                    <th className="border-0 text-muted small fw-bold text-uppercase text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-bottom">
                                        <td className="fw-bold text-dark">{u.name}</td>
                                        <td className="text-secondary">{u.email}</td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 ${u.role === 'admin' ? 'bg-danger' : u.role === 'vendor' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(u._id)} className="border-0 bg-light-danger">
                                                <i className="bi bi-trash-fill"></i> Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default AdminDashboard;
