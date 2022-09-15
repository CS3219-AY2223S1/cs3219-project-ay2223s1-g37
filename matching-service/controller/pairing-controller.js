import { ormPairMatches as _pairMatches } from '../model/match-orm.js'

export async function pairMatches(req) {
    try {
        const { username1, difficulty } = req;

        if (username1 && difficulty) {
            const resp = await _pairMatches(username1, difficulty);
            console.log(resp);
            if (resp.err) {
                console.log('Could not pair matches!');
                return
                // return res.status(400).json({message: 'Could not create a new match!'});
            } else {
                console.log(`Found match for ${username1} successfully!`);
                return
                // return res.status(201).json({message: `Created new match for ${username1} successfully!`});
            }
        } else {
            console.log('Username and/or difficulty are missing!');
            return
            // return res.status(400).json({message: 'Username and/or difficulty are missing!'});
        }
    } catch (err) {
        console.log('Database failure when pairing match!');
        return
        // return res.status(500).json({message: 'Database failure when creating new match!'})
    }
}
