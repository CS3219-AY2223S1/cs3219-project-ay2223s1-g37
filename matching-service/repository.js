import MatchModelSchema from "./model/match-model.js";
// import 'dotenv/config'

// Set up sequelize connection
import Sequelize, { Model } from "sequelize";
import DataTypes from "sequelize";
import { Op } from "sequelize";

// TODO: Decide if host should be local or remote
let sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./db/matchDB.sqlite",
});

let Match;

try {
  await sequelize.authenticate();
  console.log("Connection with SQLite has been established!");
  Match = MatchModelSchema(sequelize, DataTypes);
  Match.sync({ force: true });
} catch (err) {
  console.error("Unable to connect to DB :(");
}

export default sequelize;

export async function createMatch(params) {
  // console.log("respository.js: Create match w params " + JSON.stringify(params));
  return Match.create(params).catch((err) => {
    console.log("respository.js: Unable to add user!\n" + err);
  });
}

export async function pairMatches(matchEntryId) {
  const currentMatch = await Match.findByPk(matchEntryId);
  const username1 = currentMatch.username1;
  const username2 = currentMatch.username2;
  const difficulty = currentMatch.difficulty;
  // // Debug
  // console.log("Current user's details");
  // console.log(`Username 1: ${username1}`);
  // console.log(`Username 2: ${username2}`);
  // console.log(`Difficulty: ${difficulty}`);
  console.log("Pairing...");
  const alreadyMatched = await Match.findOne({
    where: {
      username2: username1,
      difficulty: difficulty,
    },
  });
  // console.log(`already matched: ${alreadyMatched}`);

  if (alreadyMatched != null) {
    await Match.destroy({
      where: {
        // username1: username1,
        id: matchEntryId,
        username2: "",
        difficulty: difficulty,
      },
    });
    return alreadyMatched;
  } else {
    const pendingMatches = await Match.findAll({
      where: {
        //   username1: { [Op.not]: username1 },
        id: { [Op.not]: matchEntryId },
        username2: "",
        difficulty: difficulty,
      },
    });
    // console.log(`pending matches: ${pendingMatches}`);

    if (pendingMatches.length > 0) {
      // console.log("At least one match avail");
      let user2 = pendingMatches[0];

      // This match will persist until the end of entire session
      await Match.update(
        { username2: user2.username1 },
        // { where: { username1: username1 } }
        { where: { id: matchEntryId } }
      );
      
      return Match.findByPk(matchEntryId);
    } else {
      return undefined;
    }
  }
}

export async function removeMatchTimeout(matchEntryId) {
  const currentMatch = await Match.findByPk(matchEntryId);
  // If using username search in future
  // const username1 = currentMatch.username1;
  const difficulty = currentMatch.difficulty;

  console.log("Detroying timed out match....");
  return await Match.destroy({
    where: {
      // username1: username1,
      id: matchEntryId,
      username2: "",
      difficulty: difficulty,
    },
  });
}

export async function removeMatchEndSession(roomId) {
  const currentMatch = await Match.findByPk(roomId);
  const difficulty = currentMatch.difficulty;

  console.log("Detroying match....");
  return await Match.destroy({
    where: {
      id: roomId,
      difficulty: difficulty,
    },
  });
}
