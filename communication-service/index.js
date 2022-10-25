import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Hello World from communication-service");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res) => res.send("Hello World from communication-service"));

io.on("connection", (socket) => {
  console.log("Successfully connected via Socket.io!");

  socket.on("disconnect", () => {
    console.log("User disconnected from Socket.io");
  });

  socket.on("start chat", (roomId) => {
    console.log(`Joined room: ${roomId}`);
    socket.join(roomId);
  });

  socket.on("send message", (data) => {
    console.log(`Emitting data:`);
    console.log(data);
    socket.to(data.room).emit("receive message", data);
  });
});

httpServer.listen(8004, () =>
  console.log("communication-service listening on port 8004")
);

export { app };
