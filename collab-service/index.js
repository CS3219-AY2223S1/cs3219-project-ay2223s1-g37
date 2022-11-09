import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  uploadChanges,
  switchRoles,
  setQuestion,
} from "./controller/room-controller.js";
import RoomModelSchema from "./model/room-model.js";
import "dotenv/config";
import { Sequelize, DataTypes } from "sequelize";

// Set up sequelize connection
async function initSequelize() {
  const sequelizeHost = process.env.NODE_ENV == "production" ? process.env.DB_CLOUD_HOST : "localhost";
  const sequelizeStorage = process.env.NODE_ENV == "production"
                            ? process.env.DB_CLOUD_STORAGE
                            : process.env.NODE_ENV == "development"
                              ? "./db/roomDB.sqlite"
                              : "./db/roomDB-test.sqlite";

  let sequelize = new Sequelize("database", "username", "password", {
    host: sequelizeHost,
    dialect: "sqlite",
    storage: sequelizeStorage,
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

  return { sequelize: sequelize, Room: Room };
}

export const { sequelize, Room } = await initSequelize();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Hello World from collaboration-service");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res) => res.send("Hello World from collaboration-service"));

io.on("connection", (socket) => {
  console.log("Successfully connected via Socket.io!");

  socket.on("disconnect", () => {
    console.log("User disconnected from Socket.io");
  });

  socket.on("createRoom", (data) => createRoom(data, socket));

  socket.on("sessionEnded", (data) => updateRoom(data, socket));

  socket.on("switchRoles", (data) => switchRoles(data, socket));

  socket.on("sessionComplete", (data) => deleteRoom(data, socket));

  socket.on("uploadChanges", (data) => uploadChanges(data, socket));

  socket.on("setQuestion", (data) => setQuestion(data, socket));

  socket.on("finishConfirmed", (data) => {
    socket.to(data.roomId).emit("intervieweeConfirmedFinish", data);
  });
});

httpServer.listen(8002, () =>
  console.log("room-service listening on port 8002")
);

export { app };
