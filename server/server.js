const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes')); // NEW
app.use('/api/budget', require('./routes/budgetRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Socket.io real-time chat implementation
// Simple 1-to-1 chat between user and vendor
const connectedUsers = new Map(); // Map of userId -> socketId

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Authenticate socket connection
    socket.on('authenticate', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} authenticated`);
    });

    // Join a chat room (user-vendor pair)
    socket.on('join-chat', ({ userId, vendorId }) => {
        // Create a unique room ID for this user-vendor pair
        const roomId = [userId, vendorId].sort().join('-');
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
    });

    // Send message
    socket.on('send-message', async ({ senderId, receiverId, content }) => {
        try {
            // Create room ID
            const roomId = [senderId, receiverId].sort().join('-');

            // Broadcast message to room
            io.to(roomId).emit('new-message', {
                senderId,
                receiverId,
                content,
                timestamp: new Date(),
                read: false
            });

            console.log(`Message sent in room ${roomId}`);
        } catch (error) {
            console.error('Socket message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
        const roomId = [senderId, receiverId].sort().join('-');
        socket.to(roomId).emit('user-typing', { userId: senderId });
    });

    // Budget alert (triggered by budget validation middleware)
    socket.on('budget-alert', ({ userId, budgetInfo }) => {
        const userSocketId = connectedUsers.get(userId);
        if (userSocketId) {
            io.to(userSocketId).emit('budget-warning', budgetInfo);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.userId) {
            connectedUsers.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected`);
        }
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Socket.io enabled for real-time features`);
});
