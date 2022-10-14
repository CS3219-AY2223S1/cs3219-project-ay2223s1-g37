import {
  createRoom,
  updateRoom,
  removeRoom,
  uploadChanges,
} from "../repository.js";

export async function ormCreateRoom(username1, username2, difficulty) {
  // console.log("match-orm: create match w {" + username1 + ", " + difficulty + "}");
  try {
    let interviewer = username1;
    let allocatedTime = 0;

    switch (difficulty) {
      case "Easy":
        allocatedTime = 20 * 60;
        break;
      case "Medium":
        allocatedTime = 30 * 60;
        break;
      case "Hard":
        allocatedTime = 40 * 60;
        break;
      default:
        allocatedTime = 0;
    }

    const newRoom = await createRoom({
      username1,
      username2,
      interviewer,
      difficulty,
      allocatedTime,
    });
    newRoom.save();
    // const roomId = newRoom.id;
    // return { roomId: roomId };
    return { room: newRoom };
  } catch (err) {
    console.log("ERROR: Could not create new room");
    return { err };
  }
}

export async function ormRemoveRoom(roomId) {
  try {
    const removedRoomId = await removeRoom(roomId);
    return removedRoomId;
  } catch (err) {
    return { err };
  }
}

export async function ormUpdateRoom(roomId) {
  try {
    const isComplete = await updateRoom(roomId);
    console.log(`room-orm response, room updated: ${isComplete}`);
    return isComplete;
  } catch (err) {
    return { err };
  }
}

export async function ormUploadChanges(roomId, docChanges) {
  try {
    const updatedContent = await uploadChanges(roomId, docChanges);
    console.log(`room-orm response, changes uploaded: ${updatedContent}`);
    return updatedContent;
  } catch (err) {
    return { err };
  }
}
