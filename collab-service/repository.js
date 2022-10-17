import RoomModelSchema from "./model/room-model.js";
import "dotenv/config";

// Set up sequelize connection
import Sequelize, { Model } from "sequelize";
import DataTypes from "sequelize";
import { Op } from "sequelize";

// TODO: Decide if host should be local or remote
let sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  storage: "./db/roomDB.sqlite",
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

export default sequelize;

export async function createRoom(params) {
  // console.log("respository.js: Create room w params " + JSON.stringify(params));

  const createdRoom = await Room.create(params).catch((err) => {
    console.log("respository.js: Unable to add room!\n" + err);
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
      removeRoom(allRooms[i].id);
    } else {
      lowestId = allRooms[i].id;
      removeRoom(lowestId);
    }
  }

  // Return room object corresponding to lowest room id
  for (let i = 0; i < allRooms.length; i++) {
    if (lowestId == allRooms[i].id) {
      return allRooms[i];
    }
  }
}

export async function removeRoom(roomId) {
  const currentRoom = await Room.findByPk(roomId);

  console.log("Destroying room....");
  return await Room.destroy({
    where: {
      id: roomId,
    },
  });
}

// Increment rounds by 1 every time the user gets to
export async function updateRoom(roomId) {
  console.log(`Updating room...`);
  const currentRoom = await Room.findByPk(roomId);
  if (currentRoom.rounds != 0 && currentRoom.rounds % 4 == 0) {
    // TODO: Currently % 4 because update is executing twice for some reason. Figure out why
    // Session completed
    console.log(`Session complete!!!!!!`);
    return true;
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
    return false;
  }
}

// Returns if both users are ready for next round
// Handles the switching of roles in the database
export async function switchRoles(roomId) {
  console.log(`Switching roles...`);
  const currentRoom = await Room.findByPk(roomId);
  // console.log(currentRoom.username2);
  await Room.update(
    { interviewer: currentRoom.username2 },
    { where: { id: roomId } }
  );
  return roomId;
}

export async function uploadChanges(roomId, docChanges) {
  console.log(`Uploading document changes...`);
  // const currentRoom = await Room.findByPk(roomId);
  await Room.update({ code: docChanges }, { where: { id: roomId } });
  return docChanges;
}

export async function setQuestion(roomId, question) {
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

  return { question: updatedQuestion, questionHistory: updatedQuestionHistory };
}
