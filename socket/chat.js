const { User, Message } = require('../models'); // Import your User and Message models

module.exports = function (io) {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // Join a room
        socket.on('joinRoom', async ({ room, username }) => {
            socket.join(room);
            io.to(room).emit('message', { username: 'Admin', content: `${username} has joined the room` });

            // Fetch and send the last 10 messages in this room
            const messages = await Message.find({ room }).sort({ timestamp: -1 }).limit(10);
            socket.emit('messageHistory', messages.reverse());
        });

        // Listen for chat messages
        socket.on('chatMessage', async ({ room, username, content }) => {
            const user = await User.findOne({ username });
            const message = new Message({ sender: user._id, room, content });
            await message.save();

            io.to(room).emit('message', { username, content });
        });

        // When a user disconnects
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};
