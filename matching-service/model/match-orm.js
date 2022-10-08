import {
  createMatch,
  pairMatches,
  removeMatchTimeout,
  removeMatchEndSession,
} from "../repository.js";

export async function ormCreateMatch(username1, difficulty) {
  // console.log("match-orm: create match w {" + username1 + ", " + difficulty + "}");
  try {
    let username2 = "";
    const newMatch = await createMatch({
      username1,
      username2,
      difficulty,
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
    const updatedMatch = await pairMatches(matchEntryId);
    // console.log(`updatedMatch id match-orm: ${updatedMatch}`);
    return { matchEntryId: updatedMatch };
  } catch (err) {
    console.log("Error in running pairing");
    // return { err };
  }
}

export async function ormRemoveMatchTimeout(matchEntryId) {
  try {
    const removedMatchId = await removeMatchTimeout(matchEntryId);
    return removedMatchId;
  } catch (err) {
    return { err };
  }
}

export async function ormRemoveMatchEndSession(roomId) {
  try {
    const removedMatchId = await removeMatchEndSession(roomId);
    return removedMatchId;
  } catch (err) {
    return { err };
  }
}
