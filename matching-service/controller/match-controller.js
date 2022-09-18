import { ormCreateMatch as _createMatch } from '../model/match-orm.js'

export async function createMatch(req, socket) {
    try {
        const { username1, difficulty } = req;
        
        // console.log("socket-controller: create match w {" + username1 + ", " + difficulty + "}");

        if (username1 && difficulty) {
            const resp = await _createMatch(username1, difficulty);
            console.log(resp);
            if (resp.err) {
                console.log('Could not create a new match!');
                socket.emit('matchCreationFailure');
                return
            } else {
                console.log(`Created new match for ${username1} successfully!`);
                socket.emit('matchCreationSuccess');
                return
            }
        } else {
            console.log('Username and/or difficulty are missing!');
            socket.emit('matchCreationFailure');
            return
        }
    } catch (err) {
        console.log('Database failure when creating new match!');
        socket.emit('matchCreationFailure');
        return
    }
}
