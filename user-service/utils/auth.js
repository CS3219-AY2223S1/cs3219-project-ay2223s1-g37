import jwt from 'jsonwebtoken'
import { ormCheckUser as _checkUser } from '../model/user-orm.js'

export const auth = async (req, res, next) => {
    console.log(req.headers)
    try {
        const token = req.headers?.cookie.split('=')[1]
        console.log(token)

        const verifyUser = jwt.verify(token, "helloworld") // "helloworld is the JWT secret key"
        console.log(verifyUser)
        // // todo check if it's a blacklisted token, if it is, otherwise 401

        const user = await _checkUser(verifyUser.username)
        // console.log(user.username)
        if (user) {
            return res.status(200).send({message: "Authentication succeed"})
        }

        return next()
    } catch (err) {
        return res.status(401).send({message: "Unauthorized"})
    }
}