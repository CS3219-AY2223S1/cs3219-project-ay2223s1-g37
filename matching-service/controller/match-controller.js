import { ormCreateMatch as _createMatch } from "../model/match-orm.js";
import { ormUpdateMatch as _updateMatch } from "../model/match-orm.js";
import { ormRemoveMatchTimeout as _removeMatchTimeout } from "../model/match-orm.js";
import { ormRemoveMatchEndSession as _removeMatchEndSession } from "../model/match-orm.js";

export async function createMatch(req, socket) {
  try {
    const { username1, difficulty } = req;

    // console.log("socket-controller: create match w {" + username1 + ", " + difficulty + "}");

    if (username1 && difficulty) {
      const resp = await _createMatch(username1, difficulty);
      console.log(resp);
      if (resp.err) {
        console.log("Could not create a new match!");
        socket.emit("matchCreationFailure");
        return;
      } else {
        console.log(`Created new match for ${username1} successfully!`);
        socket.emit("matchCreationSuccess", resp);
        return;
      }
    } else {
      console.log("Username and/or difficulty are missing!");
      socket.emit("matchCreationFailure");
      return;
    }
  } catch (err) {
    console.log("Database failure when creating new match!");
    socket.emit("matchCreationFailure");
    return;
  }
}

export async function updateMatch(req, socket) {
  const { roomId } = req;
  try {
    const resp = await _updateMatch(roomId);
    console.log(`match-controller response: ${resp}`);
    if (resp == true) {
      console.log("Emitting session complete");
      socket.emit("sessionComplete");
    } else {
      return;
    }
  } catch (err) {
    console.log("Database failure when updating match!");
    return;
  }
}

export async function deleteMatch(req, socket) {
  const { roomId } = req;
  try {
    const removedMatchId = await _removeMatchEndSession(roomId);
    console.log(`Deleted match: ${removedMatchId}`);
  } catch (err) {
    console.log("Error deleting match!");
    return;
  }
}
