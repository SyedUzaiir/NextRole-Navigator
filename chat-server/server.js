require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://maraheem812_db_user:cTHlAyZXbeiYCHeM@cluster0.b3gwkff.mongodb.net/NextRoleNavigator?appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB for Chat'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- API Endpoints ---

// Auth/Login: Get/Create User by Email
app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Create simple user if not exists
            user = new User({ email, name: email.split('@')[0] });
            await user.save();
        }
        res.json({ userId: user._id, name: user.name });
    } catch (err) {
        console.error('Auth error:', err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get Chat History between two users
app.get('/api/chat/history/:userId/:otherUserId', async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ error: "Could not fetch history" });
    }
});

// --- Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active users: userId -> socketId
let activeUsers = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their ID
    socket.on('join_chat', (userId) => {
        // Join a room with the userId. This allows multiple sockets (tabs) 
        // for the same user to receive messages.
        socket.join(userId);

        activeUsers.set(userId, socket.id); // Keep individual socket ID or just mark user online
        // For a more robust "online" status you might want to store a Set of socketIDs per user,
        // but for now, we just want message delivery to work.

        console.log(`User ${userId} joined chat (Socket: ${socket.id})`);
        io.emit('active_users', Array.from(activeUsers.keys()));
    });

    // Send message
    socket.on('send_message', async (data) => {
        // data: { senderId, receiverId, text }
        const { senderId, receiverId, text } = data;

        try {
            const newMessage = new Message({ senderId, receiverId, text });
            await newMessage.save();
            console.log(`Message saved from ${senderId} to ${receiverId}: ${text}`);
        } catch (err) {
            console.error('Error saving message:', err);
        }

        // Emit to receiver's room (works for all their tabs)
        io.to(receiverId).emit('receive_message', data);

        // Also emit back to sender's room so other tabs of sender see the sent message
        // (optional, but good for sync)
        io.to(senderId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        // Remove user from activeUsers
        // Note: With rooms, we don't strictly need to manage this for delivery, 
        // but likely want it for "Who is online" lists.
        let disconnectedUserId = null;

        for (let [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            console.log(`User ${disconnectedUserId} disconnected`);
            io.emit('active_users', Array.from(activeUsers.keys()));
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Chat Server running on port ${PORT}`);
});
