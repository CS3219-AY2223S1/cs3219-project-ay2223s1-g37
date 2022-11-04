import MatchModelSchema from "./match-model.js";
import "dotenv/config";
import { Sequelize, DataTypes} from "sequelize";
import { Op } from "sequelize";

// Set up sequelize connection
async function initSequelize() {
  const sequelizeHost = process.env.NODE_ENV == "production" ? process.env.DB_CLOUD_HOST : "localhost";
  const sequelizeStorage = process.env.NODE_ENV == "production"
                            ? process.env.DB_CLOUD_STORAGE
                            : process.env.NODE_ENV == "development"
                              ? "./db/matchDB.sqlite"
                              : "./db/matchDB-test.sqlite";

  let sequelize = new Sequelize("database", "username", "password", {
    host: sequelizeHost,
    dialect: "sqlite",
    storage: sequelizeStorage,
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

  return { sequelize: sequelize, Match: Match };
}

export const { sequelize, Match } = await initSequelize();

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
          id: matchEntryId,
          username2: "",
          difficulty: difficulty,
        },
      });
      updatedMatch = alreadyMatched;
    } else {
      const pendingMatches = await Match.findAll({
        where: {
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
    return { err };
  }
}

export async function ormRemoveMatchTimeout(matchEntryId) {
  try {
    const currentMatch = await Match.findByPk(matchEntryId);
    const difficulty = currentMatch.difficulty;

    console.log("Detroying timed out match....");
    const removedMatchId = await Match.destroy({
      where: {
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
    const currentMatch = await Match.findByPk(roomId);
    const difficulty = currentMatch.difficulty;

    console.log("Detroying match....");
    const removedMatchId = await Match.destroy({
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
