import { ormCreateRoom as _createRoom } from "../model/room-orm.js";
import { ormUpdateRoom as _updateRoom } from "../model/room-orm.js";
import { ormRemoveRoom as _removeRoom } from "../model/room-orm.js";
import { ormUploadChanges as _uploadChanges } from "../model/room-orm.js";

export async function createRoom(req, socket) {
  try {
    const { username1, username2, difficulty } = req;

    console.log(
      `room-controller: create room w {${username1}, ${username2}, ${difficulty}}`
    );

    if (username1 && username2 && difficulty) {
      const resp = await _createRoom(username1, username2, difficulty);
      // console.log(resp);
      if (resp.err) {
        console.log("Could not create a new room!");
        socket.emit("roomCreationFailure");
        return;
      } else {
        socket.join(resp.room.id); // Join room
        console.log(
          `Created new room for ${username1} and ${username2} successfully!`
        );
        socket.emit("roomCreationSuccess", resp);
        return;
      }
    } else {
      console.log("Usernames and/or difficulty are missing!");
      socket.emit("roomCreationFailure");
      return;
    }
  } catch (err) {
    console.log("Database failure when creating new room!");
    socket.emit("roomCreationFailure");
    return;
  }
}

export async function updateRoom(req, socket) {
  const { roomId } = req;
  try {
    const resp = await _updateRoom(roomId);
    console.log(`room-controller response: ${resp}`);
    if (resp == true) {
      console.log("Emitting session complete");
      socket.emit("sessionComplete");
    } else {
      return;
    }
  } catch (err) {
    console.log("Database failure when updating room!");
    return;
  }
}

export async function deleteRoom(req, socket) {
  const { roomId } = req;
  try {
    const removedRoomId = await _removeRoom(roomId);
    console.log(`Deleted room: ${removedRoomId}`);
  } catch (err) {
    console.log("Error deleting room!");
    return;
  }
}

export async function uploadChanges(req, socket) {
  const { roomId, docChanges } = req;
  console.log(`Updating room ${roomId}`);
  try {
    const updatedContent = await _uploadChanges(roomId, docChanges);
    socket.to(roomId).emit("documentUpdated", updatedContent);
    console.log(`Emitting document updated with content: ${updatedContent}`);
  } catch (err) {
    console.log("Error updating document!");
    return;
  }
}
