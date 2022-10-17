import express from 'express';
const router = express.Router();
import { getQuestion } from '../controller/question-controller.js';

router.get('/', (_, res) => res.send('Hello World from question-service'))
router.route('/').post(getQuestion)

export { router }