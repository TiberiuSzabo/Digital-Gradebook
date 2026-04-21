// server-mpp/src/index.js
const express = require('express');
const cors = require('cors');
const http = require('http'); // Adăugat pentru WebSockets
const { Server } = require('socket.io'); // Adăugat pentru WebSockets

const studentRoutes = require('./routes/studentRoutes');
const generatorRoutes = require('./routes/generatorRoutes');
const app = express();
const port = 3000;

// Setăm serverul HTTP și îl legăm cu Express
const server = http.createServer(app);

// Inițializăm stația radio (Socket.io)
// Permitem oricărui client de frontend (orice port) să se conecteze
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Trimitem instanța `io` prin middleware ca să o putem folosi în controllere!
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutele tale vechi de CRUD
app.use('/api/students', studentRoutes);
app.use('/api/generator', generatorRoutes);

// Aici vom adăuga rutele pentru Generatorul Silver în curând...

// Ascultăm când se conectează un client (browser) pe calea de WebSockets
io.on('connection', (socket) => {
    console.log('⚡ Un client s-a conectat pe WebSockets: ', socket.id);

    socket.on('disconnect', () => {
        console.log('🔌 Un client s-a deconectat: ', socket.id);
    });
});

// ATENȚIE: Acum folosim server.listen în loc de app.listen!
server.listen(port, () => {
    console.log(`🚀 Serverul REST API + WebSockets rulează la http://localhost:${port}`);
});