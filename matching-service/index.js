import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createMatch } from './controller/match-controller.js';
import { pairMatches } from './controller/pairing-controller.js';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors()) // config cors so that front-end can use
app.options('*', cors())

app.get('/', (req, res) => {
    res.send('Hello World from matching-service');
});

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.get('/', (_, res) => res.send('Hello World from matching-service'));

io.on('connection', (socket) => {
    console.log('Successfully connected via Socket.io!');

    socket.on('disconnect', () => {
        console.log('User disconnected from Socket.io');
    });

    socket.on('match', data => createMatch(data, socket));

    socket.on('pairing', pairMatches);

    socket.on('createRoom', data => createRoom(date, socket));
});

httpServer.listen(8001);

export { app }
