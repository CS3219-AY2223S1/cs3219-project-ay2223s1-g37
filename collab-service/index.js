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
});

httpServer.listen(8002, () =>
  console.log("room-service listening on port 8002")
);

export { app };
