import { Match } from "../index.js";
import { Op } from "sequelize";

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
