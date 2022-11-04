import MatchModelSchema from "./match-model.js";
import "dotenv/config";

// Set up sequelize connection
import Sequelize, { Model } from "sequelize";
import DataTypes from "sequelize";
import { Op } from "sequelize";

const sequelizeHost = process.env.NODE_ENV == "production" ? process.env.DB_CLOUD_HOST : "localhost";
const sequelizeStorage = process.env.NODE_ENV == "production"
                          ? process.env.DB_CLOUD_STORAGE
                          : process.env.NODE_ENV == "development"
                            // ? process.env.DB_LOCAL_STORAGE
                            // : process.env.DB_TEST_STORAGE;
                            ? "./db/matchDB.sqlite"
                            : "./db/matchDB-test.sqlite";

let sequelize = new Sequelize("database", "username", "password", {
  host: sequelizeHost,
  dialect: "sqlite",
  storage: sequelizeStorage,
});
// Uncomment out in future: Better security with a separate .env file
// let sequelize = new Sequelize("database", "username", "password", {
//   host: process.env.HOST,
//   dialect: process.env.DIALECT,
//   storage: process.env.STORAGE,
// });

let Match;

try {
  await sequelize.authenticate();
  console.log("Connection with SQLite has been established!");
  Match = MatchModelSchema(sequelize, DataTypes);
  Match.sync({ force: true });
} catch (err) {
  console.error("Unable to connect to DB :(");
}

export { sequelize, Match };

export async function ormCreateMatch(username1, difficulty) {
  // console.log("match-orm: create match w {" + username1 + ", " + difficulty + "}");
  try {
    let username2 = "";
    const params = {
      username1,
      username2,
      difficulty,
    };
    const newMatch = await Match.create(params).catch((err) => {
      console.log("match-orm.js: Unable to add user!\n" + err);
    });
    newMatch.save();
    const matchEntryId = newMatch.id;
    return { matchEntryId: matchEntryId };
  } catch (err) {
    console.log("ERROR: Could not create new match");
    return { err };
  }
}

export async function ormPairMatches(matchEntryId) {
  try {
    let updatedMatch;

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
      updatedMatch = alreadyMatched;
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

        updatedMatch = await Match.findByPk(matchEntryId);
      } else {
        updatedMatch = undefined;
      }
    }

    // console.log(`updatedMatch id match-orm: ${updatedMatch}`);
    return { matchEntryId: updatedMatch };
  } catch (err) {
    console.log("Error in running pairing");
    // return { err };
  }
}

export async function ormRemoveMatchTimeout(matchEntryId) {
  try {
    let removedMatchId;

    const currentMatch = await Match.findByPk(matchEntryId);
    // If using username search in future
    // const username1 = currentMatch.username1;
    const difficulty = currentMatch.difficulty;

    console.log("Detroying timed out match....");
    removedMatchId = await Match.destroy({
      where: {
        // username1: username1,
        id: matchEntryId,
        username2: "",
        difficulty: difficulty,
      },
    });

    return removedMatchId;
  } catch (err) {
    return { err };
  }
}

export async function ormRemoveMatchEndSession(roomId) {
  try {
    let removedMatchId;

    const currentMatch = await Match.findByPk(roomId);
    const difficulty = currentMatch.difficulty;

    console.log("Detroying match....");
    removedMatchId = await Match.destroy({
      where: {
        id: roomId,
        difficulty: difficulty,
      },
    });

    return removedMatchId;
  } catch (err) {
    return { err };
  }
}
