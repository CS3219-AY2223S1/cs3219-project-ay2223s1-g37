import express from 'express';
const router = express.Router();

router.get('/', (_, res) => res.send('Hello World from question-service'))

export { router }