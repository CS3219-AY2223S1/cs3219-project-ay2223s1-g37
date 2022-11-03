import {createUser} from './repository.js';
import UserModel from './user-model.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

import EmailTokenModel from '../model/email-token-model.js'
import BlackListTokenModel from '../model/blacklist-token-model.js'

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(email, username, password) {
    try {
        const newUser = await createUser({email, username, password});
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();
        return newUser;
    } catch (err) {
        console.log('ERROR: Could not create new user');
        return { err };
    }
}

export async function ormCheckUser(username, email) {
    try {
        let user
        if (username === 0) {
            user = await UserModel.findOne({ email: email }).exec()
        } else if (email === 0) {
            user = await UserModel.findOne({ username: username }).exec();
        }
        return user
    } catch {
        console.log('ERROR: Could not check for a user')
        return { err }
    }
}

export async function ormUpdateUser(id, newPassword, verified) {
    try {
        let user
        if (verified === 0) {
            user = await UserModel.updateOne({_id: id}, {password: newPassword}).exec()
        } else if (newPassword === 0) {
            user = await UserModel.updateOne({_id: id}, {verified: verified}).exec()
        }
        return user
    } catch (err) {
        console.log('ERROR: Could not update user')
        return {err}
    }
}

export async function ormCreateEmailToken(user) {
    try {
        const newToken = new EmailTokenModel({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
        return newToken;
    } catch (err) {
        console.log('ERROR: Could not create email token');
        return { err }
    }
}

export async function ormCheckEmailToken(user, tokenId) {
     try {
         return await EmailTokenModel.findOne({userId: user._id, token: tokenId});
    } catch (err) {
        console.log('ERROR: Could not find email token');
        return { err }
    }
}

export async function ormDeleteEmailToken(id) {
    try {
        const emailToken = await EmailTokenModel.findByIdAndRemove(id).exec()
        return emailToken
    } catch (err) {
        console.log('ERROR: Could not delete email token')
        return {err}
    }
}

export async function ormDeleteUser(username) {
    try {
        const user = await UserModel.findOneAndRemove({username: username}).exec();
        if (!user) {
            return false
        }
        return true
    } catch {
        console.log('ERROR: Could not delete for a user')
        return { err }
    }
}

export async function ormCheckPassword(username, password) {
    try {
        const user = await UserModel.findOne({username: username}).exec();
        if (user) {
            const validPassword = await bcrypt.compare(password, user.password);
            return validPassword;
        } else {
            return false;
        }
    } catch {
        console.log('ERROR: Could not check for correct password')
        return { err }
    }
}

export async function ormChangePassword(username, newPassword) {
    try {
        const user = await UserModel.findOne({username: username}).exec();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();
        return true;
    } catch (err) {
        console.log('ERROR: Could not change password');
        return { err };
    }
}

export async function ormCreateBlacklistToken(token) {
    try {
        const blacklistToken = new BlackListTokenModel({
            token: token
        })
        await blacklistToken.save()
        return blacklistToken
    } catch (err) {
        console.log('ERROR: Could not create blacklist token')
        return {err}
    }
}

