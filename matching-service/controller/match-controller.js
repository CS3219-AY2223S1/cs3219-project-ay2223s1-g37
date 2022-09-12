import { ormCreateMatch as _createMatch } from '../model/match-orm.js'

// TODO: Replace returns with emitting of results
export async function createMatch(req) {
    // console.log("socket-controller: req is " + JSON.stringify(req));
    try {
        const { username1, difficulty } = req;
        
        // console.log("socket-controller: create match w {" + username1 + ", " + difficulty + "}");

        if (username1 && difficulty) {
            // console.log("both username and difficulty are given");
            const resp = await _createMatch(username1, difficulty);
            console.log(resp);
            if (resp.err) {
                console.log('Could not create a new match!');
                return
                // return res.status(400).json({message: 'Could not create a new match!'});
            } else {
                console.log(`Created new match for ${username1} successfully!`);
                return
                // return res.status(201).json({message: `Created new match for ${username1} successfully!`});
            }
        } else {
            console.log('Username and/or difficulty are missing!');
            return
            // return res.status(400).json({message: 'Username and/or difficulty are missing!'});
        }
    } catch (err) {
        console.log('Database failure when creating new match!');
        return
        // return res.status(500).json({message: 'Database failure when creating new match!'})
    }
}
