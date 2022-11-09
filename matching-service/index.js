import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import {
  createMatch,
  deleteMatch,
} from "./controller/match-controller.js";
import { pairMatches } from "./controller/pairing-controller.js";
import MatchModelSchema from "./model/match-model.js";
import "dotenv/config";
import { Sequelize, DataTypes} from "sequelize";

// Set up sequelize connection
async function initSequelize() {
  const sequelizeHost = process.env.NODE_ENV == "production" ? process.env.DB_CLOUD_HOST : "localhost";
  const sequelizeStorage = process.env.NODE_ENV == "production"
                            ? process.env.DB_CLOUD_STORAGE
                            : process.env.NODE_ENV == "development"
                              ? "./db/matchDB.sqlite"
                              : "./db/matchDB-test.sqlite";

  let sequelize = new Sequelize("database", "username", "password", {
    host: sequelizeHost,
    dialect: "sqlite",
    storage: sequelizeStorage,
  });

  let Match;

  try {
    await sequelize.authenticate();
    console.log("Connection with SQLite has been established!");
    Match = MatchModelSchema(sequelize, DataTypes);
    Match.sync({ force: true });
  } catch (err) {
    console.error("Unable to connect to DB :(");
  }

  return { sequelize: sequelize, Match: Match };
}

export const { sequelize, Match } = await initSequelize();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

app.get("/", (req, res) => {
  res.send("Hello World from matching-service");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.get("/", (_, res) => res.send("Hello World from matching-service"));

io.on("connection", (socket) => {
  console.log("Successfully connected via Socket.io!");

  socket.on("disconnect", () => {
    console.log("User disconnected from Socket.io");
  });

  socket.on("match", (data) => createMatch(data, socket));

  socket.on("pairing", (data) => pairMatches(data, socket));

  socket.on("endSession", (data) => deleteMatch(data, socket));
});

httpServer.listen(8001, () =>
  console.log("matching-service listening on port 8001")
);

export { app };
