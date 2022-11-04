import { sequelize, Room } from "../index.js";

export async function ormCreateRoom(username1, username2, difficulty) {
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

    let newRoom;

    const params = {
      username1,
      username2,
      interviewer,
      difficulty,
      allocatedTime,
    };

    const createdRoom = await Room.create(params).catch((err) => {
      console.log("room-orm.js: Unable to add room!\n" + err);
    });
  
    const allRooms = await Room.findAll({
      where: {
        username1: params.username1,
        username2: params.username2,
        difficulty: params.difficulty,
      },
    });
  
    // Find room with lowest id and remove other rooms
    let lowestId = allRooms[0].id;
    for (let i = 1; i < allRooms.length; i++) {
      if (lowestId < allRooms[i].id) {
        ormRemoveRoom(allRooms[i].id);
      } else {
        lowestId = allRooms[i].id;
        ormRemoveRoom(lowestId);
      }
    }
  
    // Return room object corresponding to lowest room id
    for (let i = 0; i < allRooms.length; i++) {
      if (lowestId == allRooms[i].id) {
        newRoom = allRooms[i];
      }
    }
    
    return { room: newRoom };
  } catch (err) {
    console.log("ERROR: Could not create new room" + err);
    return { err };
  }
}

export async function ormRemoveRoom(roomId) {
  try {
    const currentRoom = await Room.findByPk(roomId);

    console.log("Destroying room....");
    const removedRoomId = await Room.destroy({
      where: {
        id: roomId,
      },
    });
    
    return removedRoomId;
  } catch (err) {
    return { err };
  }
}

export async function ormSwitchRoles(roomId) {
  try {
    console.log(`Switching roles...`);
    const currentRoom = await Room.findByPk(roomId);
    // console.log(currentRoom.username2);
    await Room.update(
      { interviewer: currentRoom.username2 },
      { where: { id: roomId } }
    );

    console.log(`room-orm response, switched roles in room: ${roomId}`);
    return roomId;
  } catch (err) {
    return { err };
  }
}

export async function ormUpdateRoom(roomId) {
  try {
    let isComplete;

    console.log(`Updating room...`);
    const currentRoom = await Room.findByPk(roomId);
    if (currentRoom.rounds != 0 && currentRoom.rounds % 4 == 0) {
      // Session completed
      console.log(`Session complete!!!!!!`);
      isComplete = true;
    } else {
      // Session not completed yet
      console.log(`Another round to go..........`);
      await Room.update(
        {
          rounds: sequelize.literal("rounds + 1"),
          question: null,
        },
        { where: { id: roomId } }
      );
      isComplete = false;
    }
    
    console.log(`room-orm response, room updated: ${isComplete}`);
    return isComplete;
  } catch (err) {
    console.log(err)
    return { err };
  }
}

export async function ormUploadChanges(roomId, docChanges) {
  try {
    console.log(`Uploading document changes...`);
    await Room.update({ code: docChanges }, { where: { id: roomId } });
    const updatedContent = docChanges;

    console.log(`room-orm response, changes uploaded: ${updatedContent}`);
    return updatedContent;
  } catch (err) {
    return { err };
  }
}

export async function ormSetQuestion(roomId, question) {
  try {
    console.log(`Setting question...`);
    
    const currentRoom = await Room.findByPk(roomId);
    const currentQuestion = currentRoom.question;
    let currentQnHist = currentRoom.questionHistory;

    if (currentQuestion == null) {
      console.log("no question set yet!");
      currentQnHist = currentQnHist + question._id.toString() + ",";

      await Room.update({ question: question, questionHistory: currentQnHist }, { where: { id: roomId } });
    }

    const updatedRoom = await Room.findByPk(roomId);
    const updatedQuestion = updatedRoom.question;
    const updatedQuestionHistory = updatedRoom.questionHistory;

    const updatedQnInfo = { question: updatedQuestion, questionHistory: updatedQuestionHistory };
    
    // updatedQnInfo contains question and question history
    return updatedQnInfo;
  } catch (err) {
    return { err };
  }
}
