const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();
const jwt = require('jsonwebtoken');




// Import your routes and handlers
const authRoutes = require('./routes/auth.js'); // Make sure this path is correct
const chatHandler = require('./socket/chat.js'); // Make sure this path is correct

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection string from .env
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// Use the auth routes

app.use('/api/auth', authRoutes); // Prefix all auth routes with /api/auth

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    // Use the chat handler for chat-related events
    chatHandler(io, socket);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Serve the home route
app.get('/', (req, res) => {
    res.send('Chat Server is running');
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
