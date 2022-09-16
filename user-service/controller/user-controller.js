import { ormCheckUser as _checkUser } from '../model/user-orm.js'
import { ormCreateUser as _createUser } from '../model/user-orm.js'
import jwt from 'jsonwebtoken'

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
    
        if (!user) {
            return res.status(404).json({message: `Username: ${username} not found in database!`})
        }
        // todo: add check to check if password is correct and return 401/403 (need check) if incorrect password
        // todo: add check to check if there are any fields left blank, return 500 if so

        const token = jwt.sign({
            username: username
        }, "helloworld", { expiresIn: '3h'}) // helloworld is the jwt secret key, it's just an example and should put in env file
        
        return res.status(200).json({message: 'Authentication successful', token: token})
    } catch (err) {
        return res.status(500).json({message: 'Database failure when retrieving a user!'})
    }
}

export async function deleteUser(req, res) {

}
