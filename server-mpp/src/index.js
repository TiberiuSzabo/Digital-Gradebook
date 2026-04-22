// server-mpp/src/index.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./graphql/schema');

// Import rute
const studentRoutes = require('./routes/studentRoutes');
const generatorRoutes = require('./routes/generatorRoutes');

const app = express();
const port = 3000;

// 1. Creăm serverul HTTP și îl legăm cu Express
const httpServer = http.createServer(app);

// 2. Inițializăm WebSockets (Socket.io) pe serverul HTTP
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 3. Middleware-uri de bază
app.use(cors());
app.use('/api', express.json());
// Trimitem instanța io prin middleware pentru rutele REST
app.use((req, res, next) => {
    req.io = io;
    next();
});

// 4. Configurare GraphQL
async function startApolloServer() {
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    // Integrăm Apollo în Express
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    // 5. Rutele tale REST (vechi)
    app.use('/api/students', studentRoutes);
    app.use('/api/generator', generatorRoutes);

    // 6. Logică WebSockets
    io.on('connection', (socket) => {
        console.log('⚡ Un client s-a conectat pe WebSockets: ', socket.id);
        socket.on('disconnect', () => {
            console.log('🔌 Un client s-a deconectat: ', socket.id);
        });
    });

    // 7. PORNIREA SERVERULUI (Folosim httpServer.listen, nu app.listen)
    httpServer.listen(port, () => {
        console.log(`🚀 Server complet pornit la http://localhost:${port}`);
        console.log(`📊 REST API: http://localhost:${port}/api/students`);
        console.log(`🧬 GraphQL Playground: http://localhost:${port}/graphql`);
        console.log(`📡 WebSockets: Activ pe portul ${port}`);
    });
}

// Pornim tot sistemul
startApolloServer();