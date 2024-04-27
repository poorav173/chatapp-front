const app = require('./app');
const connect = require('./config/db');
const http = require('http');
const socketIO = require('socket.io');
const { ExpressPeerServer } = require('peer');

const server = http.createServer(app);
const io = socketIO(server, {
    pingTimeOut: 600000,
    cors: {
        origin: "http://localhost:3002"
    },
});

// Set up Peer server
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/myapp' // Modify this path as needed
});
app.use('/peerjs', peerServer);

// Socket.io event listeners
io.on("connection", (socket) => {
    console.log("A user connected");

    // User setup
    socket.on('setup', (userData) => {
        console.log(`User ${userData._id} joined the chat`);
        socket.join(userData._id);
        socket.emit("connected");
    });

    // Join chat room
    socket.on("join chat", (room) => {
        console.log(`User joined chat room ${room}`);
        socket.join(room);
    });

    // New message
    socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;
        if (!chat.users) return console.log("Chat users not defined");

        chat.users.forEach(user => {
            if (user._id === newMessageReceived.sender._id) return;
            io.to(user._id).emit("message received", newMessageReceived);
        });
    });

    // Signaling for audio/video calls
    socket.on('offer', (offer, receiverId) => {
        console.log(offer, receiverId, "offer.....");
        socket.to(receiverId).emit('offer', offer, socket.id);
    });

    socket.on('answer', (answer, senderId) => {
        console.log(answer, senderId, "answer........");
        socket.to(senderId).emit('answer', answer);
    });

    socket.on('candidate', (candidate, targetId) => {
        console.log(candidate, targetId, "candidate.......");
        socket.to(targetId).emit('candidate', candidate);
    });

    // Disconnect event
    socket.on("disconnect", () => {
        console.log("A user disconnected");    
    });
});

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

connect();
