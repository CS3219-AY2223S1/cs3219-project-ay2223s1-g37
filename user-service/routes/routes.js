import express from 'express';
const router = express.Router();
import { createUser, userLogin, deleteUser, 
    userLogout, changePassword, verifyEmailToken, 
    resetPasswordUsingEmail,
    resetPassword
} from '../controller/user-controller.js';
import {auth} from "../utils/auth.js"

// Controller will contain all the User-defined Routes
router.get('/', (_, res) => res.send('Hello World from user-service'))
router.post('/signup', createUser)

router.route('/')
    .post(userLogin)
    .delete(deleteUser, auth)
    .put(changePassword, auth)

router.route('/:id/:token')
    .get(verifyEmailToken)

router.route('/auth')
    .get(auth)
    .post(userLogout, auth)

router.route('/reset')
    .post(resetPasswordUsingEmail)

router.route('/reset/password')
    .post(resetPassword)

export { router }