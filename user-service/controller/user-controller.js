import { ormCheckUser as _checkUser } from '../model/user-orm.js'
import { ormCreateUser as _createUser } from '../model/user-orm.js'
import { ormDeleteUser as _deleteUser } from '../model/user-orm.js'
import { ormCheckPassword as _checkPassword } from '../model/user-orm.js'
import { ormChangePassword as _changePassword } from '../model/user-orm.js'
import { ormCheckEmail as _checkEmail } from '../model/user-orm.js'
import { ormCreateEmailToken as _createEmailToken } from '../model/user-orm.js'
import { ormCheckEmailToken as _checkEmailToken } from '../model/user-orm.js'
import { ormDeleteEmailToken as _deleteEmailToken } from '../model/user-orm.js'
import { ormUpdateUser as _updateUser } from '../model/user-orm.js'
import { ormCreateBlacklistToken as _createBlacklistToken } from '../model/user-orm.js'

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { sendEmail } from '../utils/email.js'

function validateEmail(email) {
    return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

export async function createUser(req, res) {
    try {
        const { email, username, password } = req.body;
        if (!validateEmail(email)) {
            return res.status(400).json({message: "Invalid Email Format!"})
        }

        const newUser = await _checkUser(username, 0);
        if (newUser) {
           return res.status(409).json({message: `Username ${username} already exist!`})
        }

        const newEmail = await _checkEmail(email)
        if (newEmail) {
           return res.status(409).json({message: `Email already exist!`})
        }

        if (email && username && password) {
            const user = await _createUser(email, username, password);
            if (!user) {
                return res.status(400).json({message: 'Could not create a new user!'});
            } else {
                const emailToken = await _createEmailToken(user)
                if (emailToken) {
                    let message = 'Hello!\n\nPlease click on the link below to verify your account:\n'
                    message += `${process.env.URI_USER_SVC}/${user.username}/${emailToken.token}`
                    sendEmail(user.email, "Verify Account Creation", message)
                    return res.status(201).json({message: `Created new user ${username} successfully!`});
                }
                return res.status(400).json({message: 'Could not save email'});
            }
        } else {
            return res.status(400).json({message: 'Email, Username and/or Password are missing!'});
        }
    } catch (err) {
        return res.status(500).json({message: 'Database failure when creating new user!'})
    }
}

export async function verifyEmailToken(req, res) {
    try {
        const username = req.params.id
        const tokenId = req.params.token

        const user = await _checkUser(username, 0)

        if (!user) {
            return res.status(404).json({message: 'User is not found'})
        }

        const verifyToken = await _checkEmailToken(user, tokenId)
        if (verifyToken) {
            // remove email token from email token database
            const emailToken = await _deleteEmailToken(verifyToken._id)
        
            // update user verification to true
            const updateUser = await _updateUser(user._id, 0, true)
            if (updateUser) {
                return res.status(200).json({message: "Email successfully verified! You can now log in"})
            }
            return res.status(400).json ({ message: 'Unable to update' })
        } else {
            return res.status(404).json({message: "Verification failed! Token cannot be found!"})
        }
    } catch (err) {
        return res.status(500).json({message: 'Error verifying user!'})
    }
}

export async function userLogin(req, res) {
    try {
        const { username, password } = req.body;
        const user = await _checkUser(username, 0);

        // todo: add check to check if there are any fields left blank, return 500 if so
        if (!username || !password) {
            return res.status(400).json({message: 'Username and/or Password are missing!'})
        }

        if (user && user.verified) {
            // todo: add check to check if password is correct and return 401/403 (need check) if incorrect password
            const validPassword = await _checkPassword(username, password);
            if (validPassword) {
                const token = jwt.sign({
                    username: username
                }, process.env.JWT_SECRET_KEY, { expiresIn: '3h'}) // helloworld is the jwt secret key, it's just an example and should put in env file
                res.cookie('token', token, { httpOnly: true }) // httponly false to allow cookie to pass to front
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
    try {
        const token = req.headers?.cookie.split('=')[1]
        const blacklistedToken = await _createBlacklistToken(token)
        return res.clearCookie("token").status(200).json({message: "Successfully log out!", token: blacklistedToken.token})
    } catch (err) {
        return res.status(500).json({message: 'Error logging user out!'})
    }
}

export async function deleteUser(req, res) {
    try {
        // todo: might need to use token for authentication to delete
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({message: 'Username and/or Password are missing!'})
        }

        const user = await _checkUser(username, 0)
        if (user) {
            const validPassword = await _checkPassword(username, password);
            if (validPassword) { // true route
                const user = await _deleteUser(username)
                if (user) {
                    res.clearCookie("token") // clear token
                    return res.status(200).json({message: `Username ${username} successfully deleted`})
                }
            } else {
                return res.status(401).json({message: 'Incorrect password! Unable to delete account'})
            }
        } else {
            return res.status(404).json({message: `Unable to find username ${username} in database` })
        }
    } catch (err) {
        return res.status(500).json({message: "Error deleting account"})
    }
}

export async function resetPasswordUsingEmail(req, res) {
    try {
        const { email } = req.body
        if (!validateEmail(email)) {
            return res.status(400).json({message: "Invalid Email Format!"})
        }
        
        const user = await _checkUser(0, email)

        if (!user) {
            return res.status(404).json({ message: 'Email cannot be found in database!'})
        }

        const emailToken = await _createEmailToken(user)
        if (emailToken) {
            let message = 'Hello!\n\nPlease click on the link below to reset your password:\n'
            message += `http://localhost:3000/reset/${user.username}/${emailToken.token}`
            sendEmail(user.email, "Reset password", message)
            return res.status(200).json({message: `Successfully sent email`});
        }
        return res.status(400).json({message: 'Could not send email'});
    } catch {
        return res.status(500).json({message: 'Database failure when retrieving email from database!'})
    }
}

export async function resetPassword(req, res) {
    try {
        const { id, token, newPassword } = req.body
        const user = await _checkUser(id, 0)

        if (!user) {
            return res.status(404).json({message: 'User is not found'})
        }

        const verifyToken = await _checkEmailToken(user, token)
        if (verifyToken) {
            // remove email token from email token database
            const emailToken = await _deleteEmailToken(verifyToken._id)
        
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            const updateUser = _updateUser(user._id, hashedPassword, 0)
            if (updateUser) {
                return res.status(200).json({message: "Reset password is successful! You can now log in"})
            }
            return res.status(400).json({message: 'Unable to reset'})
        } else {
            return res.status(401).json({message: "Token cannot be found!"})
        }
    } catch (err) {
        return res.status(500).json({message: 'Error resetting password'})
    }
}

export async function changePassword(req, res) {
    try {
        const { username, oldPassword, newPassword } = req.body;
        const user = await _checkUser(username, 0);

        if (!username || !oldPassword || !newPassword) {
            return res.status(400).json({message: 'Username and/or Password are missing!'})
        }
        if (user) {
            const validPassword = await _checkPassword(username, oldPassword);
            if (validPassword) {
                const resp = await _changePassword(username, newPassword);
                if (resp.err) {
                    return res.status(400).json({message: 'Could not change password!'});
                } else {
                    return res.status(200).json({message: 'Password changed successfully!'})
                }
            } else {
                return res.status(401).json({message: 'Incorrect password! Unable to update account'})
            }
        } else {
            return res.status(404).json({message: `Username: ${username} not found in database!`})
        }       
    } catch (err) {
        return res.status(500).json({message: 'Database failure when changing password!'})
    }
}