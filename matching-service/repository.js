import MatchModelSchema from './model/match-model.js';
// import 'dotenv/config'

// Set up sequelize connection
import Sequelize from 'sequelize';
import DataTypes from 'sequelize';
import { Op } from 'sequelize';

let sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: "./db/database.sqlite"
}); // not sure what the uri should be

let Match;

try {
    await sequelize.authenticate();
    console.log("Connection with SQLite has been established!");
    Match = MatchModelSchema(sequelize, DataTypes);
    Match.sync({force: true});
} catch (err) {
    console.error("Unable to connect to DB :(");
}

export default sequelize;

export async function createMatch(params) {
    // console.log("respository.js: Create match w params " + JSON.stringify(params));
    return Match.create(params)
        .catch((err) => {
            console.log('respository.js: Unable to add user!\n' + err);
        });
}

export async function pairMatches(params) {
    // console.log("pairing...");
    const pendingMatches = await Match.findAll({
        where: {
            username1: {[Op.not]: params.username1},
            username2: '',
            difficulty: params.difficulty
        }
    });

    if (pendingMatches.length > 0) {
        // console.log("At least one match avail");
        let user2 = pendingMatches[0];

        await Match.update(
            {username2: user2.username1},
            {where: {username1: params.username1}}
        );
        
        await Match.destroy({
            where: {
                username1: user2.username1
            }
        });
    }
}

