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
  storage: "./db/database.sqlite",
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
    },
  });
  // console.log(`already matched: ${alreadyMatched}`);

  if (alreadyMatched != null) {
    return await Match.destroy({
      where: {
        // username1: username1,
        id: matchEntryId,
        username2: "",
        difficulty: difficulty,
      },
    });
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
      return pendingMatches[0];
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

  console.log("Detroying....");
  return await Match.destroy({
    where: {
      // username1: username1,
      id: matchEntryId,
      username2: "",
      difficulty: difficulty,
    },
  });
}

export async function removeMatchEndSession(matchEntryId) {
  const currentMatch = await Match.findByPk(matchEntryId);
  const difficulty = currentMatch.difficulty;

  console.log("Detroying....");
  return await Match.destroy({
    where: {
      id: matchEntryId,
      difficulty: difficulty,
    },
  });
}

// Increment rounds by 1 every time the user gets to
export async function updateMatch(matchEntryId) {
  console.log(`Updating match...`);
  const currentMatch = await Match.findByPk(matchEntryId);
  if (currentMatch.rounds != 0 && currentMatch.rounds % 4 == 0) {
    // TODO: Currently % 4 because update is executing twice for some reason
    // Session completed
    console.log(`Session complete!!!!!!`);
    return true;
  } else {
    // Session not completed yet
    console.log(`Another round to go..........`);
    await Match.update(
      { rounds: Sequelize.literal("rounds + 1") },
      { where: { id: matchEntryId } }
    );
    return false;
  }
}
