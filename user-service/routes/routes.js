import express from 'express';
const router = express.Router();
import { createUser } from '../controller/user-controller.js';

// Controller will contain all the User-defined Routes
router.get('/', (_, res) => res.send('Hello World from user-service'))
router.post('/', createUser)

export { router }