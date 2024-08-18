const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

// הגדרת חיבור למונגוDB
mongoose.connect('mongodb://localhost/chatApp')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const csrfProtection = csurf({ cookie: true });

// שימוש ב-cookie-parser לפני CSRF
app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 100 // הגבלת מספר הבקשות לכל IP
});
app.use('/api/', apiLimiter);

// הגדרת CSRF
app.use(csrfProtection);

// מודלים עבור MongoDB
const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    userName: String,
    message: String,
    image: String
});

const Message = model('Message', messageSchema);

let users = {}; // אובייקט לשמירה על משתמשים לפי מזהי הסוקט

io.on('connection', (socket) => {
    console.log('User connected');

    // טיפול במשתמש חדש
    socket.on('new user', (userName) => {
        if (!userName || typeof userName !== 'string') return; // אימות שם המשתמש

        // הסרת משתמש קודם אם קיים
        const previousUserId = Object.keys(users).find(id => users[id] === userName);
        if (previousUserId) {
            delete users[previousUserId];
            io.to(previousUserId).emit('user list', Object.values(users));
        }

        users[socket.id] = userName;
        io.emit('user list', Object.values(users));
    });

    // טיפול בהודעות נכנסות
    socket.on('chat message', async (data) => {
        if (!data.userName || !data.message || typeof data.userName !== 'string' || typeof data.message !== 'string') return; // אימות נתונים

        const message = new Message({
            userName: data.userName,
            message: data.message,
            image: data.image
        });

        try {
            await message.save();
            const messages = await Message.find();
            io.emit('chat message', messages);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    // טעינת הודעות ראשונית
    (async () => {
        try {
            const messages = await Message.find();
            io.emit('chat message', messages);
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    })();

    // טיפול במחיקת הודעות
    socket.on('delete message', async (messageId) => {
        if (typeof messageId !== 'string') return; // אימות מזהה ההודעה

        try {
            await Message.deleteOne({ _id: messageId });
            const messages = await Message.find();
            io.emit('chat message', messages);
            io.emit('message deleted', messageId); // הודעה לכל הלקוחות
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    });

    // טיפול בהתנתקות
    socket.on('logout', () => {
        const userName = users[socket.id];
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });

    // טיפול בהיפרדות
    socket.on('disconnect', () => {
        console.log('User disconnected');
        delete users[socket.id];
        io.emit('user list', Object.values(users));
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
