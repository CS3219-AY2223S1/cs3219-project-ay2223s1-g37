import { createMatch } from '../repository.js';

export async function ormCreateMatch(username1, difficulty) {
    // console.log("match-orm: create match w {" + username1 + ", " + difficulty + "}");
    try {
        let username2 = "";
        const newMatch = await createMatch({username1, username2, difficulty});
        newMatch.save();
        return true;
    } catch (err) {
        console.log('ERROR: Could not create new match');
        return { err };
    }
}

