import { createUser } from './repository.js';
import UserModel from './user-model.js'

//need to separate orm functions from repository to decouple business logic from persistence
export async function ormCreateUser(username, password) {
    try {
        const newUser = await createUser({username, password});
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
