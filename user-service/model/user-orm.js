import { createUser } from './repository.js';
import UserModel from './user-model.js'
import bcrypt from 'bcrypt'

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(username, password) {
    try {
        const newUser = await createUser({username, password});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        newUser.password = hashedPassword;
        newUser.save();
        return true;
    } catch (err) {
        console.log('ERROR: Could not create new user');
        return { err };
    }
}

export async function ormCheckUser(username) {
    try {
        const user = await UserModel.find({username: username});
        console.log(user)
        if (user.length !== 0) {
            return true;
        } else {
            return false;
        }
    } catch {
        console.log('ERROR: Could not check for a user')
        return { err }
    }
}


export async function ormDeleteUser(username) {
    try {
        await UserModel.findOneAndRemove({username: username})
    } catch {
        console.log('ERROR: Could not delete for a user')
        return { err }
    }
}

export async function ormCheckPassword(username, password) {
    try {
        const user = await UserModel.findOne({username: username});
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
        const user = await UserModel.findOne({username: username});
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        user.save();
        return true;
    } catch (err) {
        console.log('ERROR: Could not change password');
        return { err };
    }
}

