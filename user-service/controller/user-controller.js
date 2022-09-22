import { ormCheckUser as _checkUser } from '../model/user-orm.js'
import { ormCreateUser as _createUser } from '../model/user-orm.js'
import { ormDeleteUser as _deleteUser } from '../model/user-orm.js'
import { ormCheckPassword as _checkPassword } from '../model/user-orm.js'
import { ormChangePassword as _changePassword } from '../model/user-orm.js'

import jwt from 'jsonwebtoken'
import BlackListTokenModel from '../model/blacklist-token-model.js'

export async function createUser(req, res) {
    try {
        const { username, password } = req.body;
        const newUser = await _checkUser(username);
        if (newUser) {
           return res.status(409).json({message: `Username ${username} already exist!`})
        }
        if (username && password) {
            const resp = await _createUser(username, password);
            console.log(resp);
            if (resp.err) {
                return res.status(400).json({message: 'Could not create a new user!'});
            } else {
                console.log(`Created new user ${username} successfully!`)
                return res.status(201).json({message: `Created new user ${username} successfully!`});
            }
        } else {
            return res.status(400).json({message: 'Username and/or Password are missing!'});
        }
    } catch (err) {
        return res.status(500).json({message: 'Database failure when creating new user!'})
    }
}

export async function userLogin(req, res) {
    try {
        const { username, password } = req.body;
        const user = await _checkUser(username);

        // todo: add check to check if there are any fields left blank, return 500 if so
        if (!username || !password) {
            return res.status(400).json({message: 'Username and/or Password are missing!'})
        }

        if (user) {
            // todo: add check to check if password is correct and return 401/403 (need check) if incorrect password
            const validPassword = await _checkPassword(username, password);
            if (validPassword) {
                const token = jwt.sign({
                    username: username
                }, "helloworld", { expiresIn: '3h'}) // helloworld is the jwt secret key, it's just an example and should put in env file
                res.cookie('token', token, { httpOnly: true }) // httponly false to allow cookie to pass to front
                console.log(token)
                return res.status(200).json({message: 'Authentication successful', token: token})
            } else {
                return res.status(401).json({message: 'Incorrect username or password!'})
            }
        } else {
            return res.status(404).json({message: `Username: ${username} not found in database!`})
        }
    } catch (err) {
        return res.status(500).json({message: 'Error logging in!'})
    }
}

export async function userLogout(req, res) {
    console.log(req.cookies)
    try {
        const token = req.headers?.cookie.split('=')[1]
        console.log(token)
        // todo: blacklist token (probably create like a table that holds all the temporary token with time limit)
        const blacklistedToken = new BlackListTokenModel({
            token: token
        })
        blacklistedToken.save();
        return res.clearCookie("token").status(200).json({message: "Successfully log out!"})
    } catch (err) {
        return res.status(500).json({message: 'Error logging user out!'})
    }
}

export async function deleteUser(req, res) {
    try {
        // todo: might need to use token for authentication to delete
        const { username } = req.body
        const user = await _checkUser(username)
        if (user) {
            _deleteUser(username)
            return res.status(200).json({message: `Username ${username} successfully deleted`})
        }
        return res.status(404).json({message: `Unable to find username ${username} in database` })
    } catch (err) {
        return res.status(500).json({message: "Error deleting account"})
    }
}

export async function changePassword(req, res) {
    try {
        const { username, password } = req.body;
        const user = await _checkUser(username);

        if (!username || !password) {
            return res.status(400).json({message: 'Username and/or Password are missing!'})
        }

        if (user) {
            const resp = await _changePassword(username, password);
            if (resp.err) {
                return res.status(400).json({message: 'Could not change password!'});
            } else {
                return res.status(200).json({message: 'Password changed successfully!'})
            }
        } else {
            return res.status(404).json({message: `Username: ${username} not found in database!`})
        }       
    } catch (err) {
        return res.status(500).json({message: 'Database failure when changing password!'})
    }
}