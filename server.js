const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());
app.use(express.static(__dirname)); 

const DB_FILE = path.join(__dirname, 'database.json');
if (!fs.existsSync(DB_FILE)) fs.writeJsonSync(DB_FILE, { users: [] });

// Database API
app.get('/api/db', (req, res) => res.json(fs.readJsonSync(DB_FILE)));
app.post('/api/db', (req, res) => {
    fs.writeJsonSync(DB_FILE, req.body);
    res.send({ status: 'Saved' });
});

// Socket.io Real-time Logic
io.on('connection', (socket) => {
    socket.on('join', (username) => {
        socket.username = username;
        io.emit('chat-message', { user: 'System', text: `${username} joined!`, type: 'system' });
    });

    socket.on('send-chat', (text) => {
        io.emit('chat-message', { user: socket.username, text: text });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server flying on ${PORT}`));
