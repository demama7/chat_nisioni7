const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const csrfProtection = csurf({ cookie: true });

app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use('/api/', apiLimiter);

app.use(csrfProtection);

let users = {}; // Object to keep track of users by their socket IDs
let messages = [];
let nextMessageId = 1;

io.on('connection', (socket) => {
    console.log('User connected');
    
    // Handle new user
    socket.on('new user', (userName) => {
        if (!userName || typeof userName !== 'string') return; // Validate userName

        // Remove previous user if exists
        const previousUserId = Object.keys(users).find(id => users[id] === userName);
        if (previousUserId) {
            delete users[previousUserId];
            io.to(previousUserId).emit('user list', Object.values(users));
        }

        users[socket.id] = userName;
        io.emit('user list', Object.values(users));
    });

    // Handle incoming messages
    socket.on('chat message', (data) => {
        if (!data.userName || !data.message || typeof data.userName !== 'string' || typeof data.message !== 'string') return; // Validate data

        const message = {
            id: nextMessageId++,
            userName: data.userName,
            message: data.message,
            image: data.image,
        };
        messages.push(message);
        io.emit('chat message', messages);
    });

    // Handle message deletion
    socket.on('delete message', (messageId) => {
        if (isNaN(messageId)) return; // Validate messageId

        messages = messages.filter(msg => msg.id !== parseInt(messageId));
        io.emit('chat message', messages);
        io.emit('message deleted', messageId); // Notify all clients
    });

    // Handle logout
    socket.on('logout', () => {
        const userName = users[socket.id];
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
