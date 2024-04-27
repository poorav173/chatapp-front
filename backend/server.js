// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const cors = require('cors');

const PORT = 4000;

// Serve static files from the frontend build directory
app.use(express.static('build'));
app.use(cors({
    origin: "*"
}))
// Socket.IO logic for handling signaling between peers
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // Forward stream to peer
  socket.on('stream', (stream) => {
    socket.to(remoteUserId).emit('stream', stream, socket.id);
  });

  // Connect to user
  socket.on('connectToUser', (userId) => {
    const remoteSocket = io.sockets.sockets.get(userId);
    if (remoteSocket) {
      remoteSocket.emit('incomingCall', { senderId: socket.id });
    } else {
      // Handle user not found
      console.log('User not found');
    }
  });

  // Accept call
  socket.on('acceptCall', (senderId) => {
    socket.to(senderId).emit('callAccepted');
  });

  // Reject call
  socket.on('rejectCall', (senderId) => {
    socket.to(senderId).emit('callRejected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
