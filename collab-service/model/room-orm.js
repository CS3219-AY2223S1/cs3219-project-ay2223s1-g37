import RoomModelSchema from "./room-model.js";
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
                            ? "./db/roomDB.sqlite"
                            : "./db/roomDB-test.sqlite";

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

let Room;

try {
  await sequelize.authenticate();
  console.log("Connection with SQLite has been established!");
  Room = RoomModelSchema(sequelize, DataTypes);
  Room.sync({ force: true });
} catch (err) {
  console.error("Unable to connect to room DB :(");
}

export { sequelize, Room };

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
    let removedRoomId;

    const currentRoom = await Room.findByPk(roomId);

    console.log("Destroying room....");
    removedRoomId = await Room.destroy({
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
    let switchedRoom;

    console.log(`Switching roles...`);
    const currentRoom = await Room.findByPk(roomId);
    // console.log(currentRoom.username2);
    await Room.update(
      { interviewer: currentRoom.username2 },
      { where: { id: roomId } }
    );
    switchedRoom = roomId;

    console.log(`room-orm response, switched roles in room: ${switchedRoom}`);
    return switchedRoom;
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
      // TODO: Currently % 4 because update is executing twice for some reason. Figure out why
      // Session completed
      console.log(`Session complete!!!!!!`);
      isComplete = true;
    } else {
      // Session not completed yet
      console.log(`Another round to go..........`);
      await Room.update(
        {
          rounds: Sequelize.literal("rounds + 1"),
          question: null,
        },
        { where: { id: roomId } }
      );
      isComplete = false;
    }
    
    console.log(`room-orm response, room updated: ${isComplete}`);
    return isComplete;
  } catch (err) {
    return { err };
  }
}

export async function ormUploadChanges(roomId, docChanges) {
  try {
    let updatedContent;

    console.log(`Uploading document changes...`);
    // const currentRoom = await Room.findByPk(roomId);
    await Room.update({ code: docChanges }, { where: { id: roomId } });
    updatedContent = docChanges;

    console.log(`room-orm response, changes uploaded: ${updatedContent}`);
    return updatedContent;
  } catch (err) {
    return { err };
  }
}

export async function ormSetQuestion(roomId, question) {
  try {
    let updatedQnInfo;
    // console.log(`room-orm response, question set: ${updatedQn}`);

    console.log(`Setting question...`);
    const currentRoom = await Room.findByPk(roomId);
    const currentQuestion = currentRoom.question;
    let currentQnHist = currentRoom.questionHistory;
    // console.log("current qn: ");
    // console.log(currentQuestion);
    // console.log("current qn hist: ");
    // console.log(currentQnHist);

    if (currentQuestion == null) {
      console.log("no question set yet!");
      currentQnHist = currentQnHist + question._id.toString() + ",";

      await Room.update({ question: question, questionHistory: currentQnHist }, { where: { id: roomId } });
    }

    const updatedRoom = await Room.findByPk(roomId);
    const updatedQuestion = updatedRoom.question;
    const updatedQuestionHistory = updatedRoom.questionHistory;
    
    // console.log("qn: ");
    // console.log(qn);
    // console.log("qnHist");
    // console.log(updatedQuestionHistory);

    updatedQnInfo = { question: updatedQuestion, questionHistory: updatedQuestionHistory };
    
    // updatedQnInfo contains question and question history
    return updatedQnInfo;
  } catch (err) {
    return { err };
  }
}
