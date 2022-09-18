import express from 'express';
const router = express.Router();
import { createUser, userLogin, deleteUser, userLogout } from '../controller/user-controller.js';
import {auth} from "../utils/auth.js"

// Controller will contain all the User-defined Routes
router.get('/', (_, res) => res.send('Hello World from user-service'))
router.post('/signup', createUser)
router.route('/')
    .post(userLogin)
    .delete(deleteUser)

router.route('/auth')
    .get(auth)
    .post(userLogout, auth)


export { router }