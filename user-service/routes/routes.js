import express from 'express';
const router = express.Router();
import { createUser, userLogin, deleteUser, changePassword } from '../controller/user-controller.js';

// Controller will contain all the User-defined Routes
router.get('/', (_, res) => res.send('Hello World from user-service'))
router.post('/signup', createUser)
router.post('/changepw', changePassword)
router.route('/')
    .post(userLogin)
    .delete(deleteUser)


export { router }