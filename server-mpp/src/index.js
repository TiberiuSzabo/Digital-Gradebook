// src/index.js
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes'); // Importăm rutele

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Aici legăm rutele de un prefix. Orice cerere către /api/students va merge în studentRoutes
app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
    res.send('Salut! Serverul Digital Gradebook funcționează perfect!');
});

app.listen(PORT, () => {
    console.log(`🚀 Serverul rulează la adresa http://localhost:${PORT}`);
});