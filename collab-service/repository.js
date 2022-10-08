import RoomModelSchema from "./model/room-model.js";
// import 'dotenv/config'

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
  const alreadyCreated = await Room.findOne({
    where: {
      username1: params.username1,
      username2: params.username2,
      difficulty: params.difficulty
    },
  });

  if (alreadyCreated != null) {
    return alreadyCreated;
  }

  return Room.create(params).catch((err) => {
    console.log("respository.js: Unable to add room!\n" + err);
  });
}

export async function removeRoom(roomId) {
  const currentRoom = await Room.findByPk(roomId);

  console.log("Destroying room....");
  return await Room.destroy({
    where: {
      id: roomId
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
      { rounds: Sequelize.literal("rounds + 1") },
      { where: { id: roomId } }
    );
    return false;
  }
}
