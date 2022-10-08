import { io } from 'socket.io-client';

const matchingSocket = io.connect('http://localhost:8001');
const collabSocket = io.connect('http://localhost:8002');

export { matchingSocket, collabSocket };