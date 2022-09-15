import { createMatch, pairMatches } from '../repository.js';

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

export async function ormPairMatches(username1, difficulty) {
    try {
        await pairMatches({username1, difficulty});
        return true;
    } catch (err) {
        console.log("Error in running pairing");
        return { err };
    }
}

