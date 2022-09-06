import MatchModelSchema from './model/match-model.js';
// import 'dotenv/config'

// Set up sequelize connection
import Sequelize from 'sequelize';
import DataTypes from 'sequelize';

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

