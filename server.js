const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const { escape, trim } = require('validator');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// CSRF middleware
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

let users = {};
let messages = [];
let nextMessageId = 1;

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('new user', (userName) => {
        if (!userName || typeof userName !== 'string') return;

        userName = trim(escape(userName));
        const previousUserId = Object.keys(users).find(id => users[id] === userName);
        if (previousUserId) {
            delete users[previousUserId];
            io.to(previousUserId).emit('user list', Object.values(users));
        }

        users[socket.id] = userName;
        io.emit('user list', Object.values(users));
    });

    socket.on('chat message', (data) => {
        if (!data.userName || !data.message || typeof data.userName !== 'string' || typeof data.message !== 'string') return;

        const userName = trim(escape(data.userName));
        const message = {
            id: nextMessageId++,
            userName: userName,
            message: trim(escape(data.message)),
            image: data.image,
        };
        messages.push(message);
        io.emit('chat message', messages);
    });

    socket.on('delete message', (messageId) => {
        if (isNaN(messageId)) return;

        messages = messages.filter(msg => msg.id !== parseInt(messageId));
        io.emit('chat message', messages);
        io.emit('message deleted', messageId);
    });

    socket.on('logout', () => {
        const userName = users[socket.id];
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
