import jwt from 'jsonwebtoken'
import { ormCheckUser as _checkUser } from '../model/user-orm.js'
import BlackListTokenModel from '../model/blacklist-token-model.js'

export const auth = async (req, res, next) => {
    console.log(req.headers)
    try {
        const token = req.headers?.cookie.split('=')[1]
        console.log(token)

        const verifyUser = jwt.verify(token, process.env.JWT_SECRET_KEY) // "helloworld is the JWT secret key"
    
        const blacklistToken = await BlackListTokenModel.find({ token }).exec();
        if (blacklistToken.length > 0) {
            return res.status(401).json({
                message: 'Authentication Failed'
            })
        }

        const user = await _checkUser(verifyUser.username)
        // console.log(user.username)
        if (user) {
            return res.status(200).send({message: "Authentication succeed", user})
        }

        return next()
    } catch (err) {
        return res.status(401).send({message: "Unauthorized"})
    }
}