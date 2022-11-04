import { io } from "socket.io-client";

/*---- For usage without Docker ----*/
// const matchingSocket = io.connect("http://localhost:8001");
// const collabSocket = io.connect("http://localhost:8002");
// const chatSocket = io.connect("http://localhost:8004");
/*----------------------------------*/

/*---- For usage with Docker ----*/
const matchingSocket = io.connect("/", { path: "/matching-socket" });
const collabSocket = io.connect("/", { path: "/collab-socket" });
const chatSocket = io.connect("/", { path: "/communication-socket" });
/*----------------------------------*/

export { matchingSocket, collabSocket, chatSocket };
