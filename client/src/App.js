import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { toastConfig } from './utils/toastConfig';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventPage from './pages/EventPage';
import FindVendors from './pages/FindVendors';
import VendorBooking from './pages/VendorBooking';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import VendorRegistration from './pages/VendorRegistration';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Toaster
                position={toastConfig.position}
                toastOptions={toastConfig}
            />
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
                    <Route path="/events/:id" element={<PrivateRoute roles={['user']}><EventPage /></PrivateRoute>} />
                    <Route path="/find-vendors" element={<PrivateRoute roles={['user']}><FindVendors /></PrivateRoute>} />
                    <Route path="/vendor/:vendorId/book" element={<PrivateRoute roles={['user']}><VendorBooking /></PrivateRoute>} />
                    <Route path="/messages" element={<PrivateRoute roles={['user', 'vendor']}><Messages /></PrivateRoute>} />
                    <Route path="/vendor-dashboard" element={<PrivateRoute roles={['vendor']}><VendorDashboard /></PrivateRoute>} />
                    <Route path="/vendor-registration" element={<PrivateRoute roles={['vendor']}><VendorRegistration /></PrivateRoute>} />
                    <Route path="/admin-dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute roles={['user', 'vendor', 'admin']}><Profile /></PrivateRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
