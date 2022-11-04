import { app } from "../index.js";
import chai, { should } from "chai";
import chaiHttp from "chai-http";
import { io, Socket } from "socket.io-client";

const assert = chai.assert;

chai.use(chaiHttp);
chai.should(); // assertion lib

describe("Communication Service tests", () => {
  let clientSocket;
  let clientSocket2;
  let clientSocket3;

  beforeEach((done) => {
    clientSocket = io.connect("http://localhost:8004");
    clientSocket2 = io.connect("http://localhost:8004");
    clientSocket3 = io.connect("http://localhost:8004");
    clientSocket.once("connect", done);
  });

  after(() => {
    clientSocket.disconnect();
    clientSocket2.disconnect();
    clientSocket3.disconnect();
  });

  describe("GET", () => {
    it("should show hello world message", (done) => {
      chai
        .request(app)
        .get("/")
        .end((err, res) => {
          res.should.have.status(200);
          res.text.should.equal("Hello World from communication-service");
          done();
        });
    });
  });

  describe("Send a chat message", () => {
    it("should receive the same message data for user in same room", (done) => {
      const roomId = 1;
      const otherRoomId = 2;
      clientSocket.emit("start chat", roomId);
      clientSocket2.emit("start chat", roomId);
      clientSocket3.emit("start chat", otherRoomId);

      const username = "user1";
      const currentMessage = "Hello there";
      const time = "12:12";
      const messageData = {
        room: roomId,
        author: username,
        message: currentMessage,
        time: time,
      };
      let client2CallCount = 0;
      let client3CallCount = 0;
      clientSocket.emit("send message", messageData);
      clientSocket2.once("receive message", (data) => {
        client2CallCount++;
        data.room.should.equal(roomId);
        data.author.should.equal(username);
        data.message.should.equal(currentMessage);
        data.time.should.equal(time);
      });
      clientSocket3.once("receive message", (data) => {
        client3CallCount++;
      });
      setTimeout(() => {
        // Only client2 should have received the message
        client2CallCount.should.equal(1);
        client3CallCount.should.equal(0);
        done();
      }, 1000);
    });

    it("should notify the other user that there is a new chat message", (done) => {
      const roomId = 1;
      const otherRoomId = 2;
      clientSocket.emit("start chat", roomId);
      clientSocket2.emit("start chat", roomId);
      clientSocket3.emit("start chat", otherRoomId);

      const username = "user1";
      const currentMessage = "Hello there";
      const time = "12:12";
      const messageData = {
        room: roomId,
        author: username,
        message: currentMessage,
        time: time,
      };
      let client2CallCount = 0;
      let client3CallCount = 0;
      clientSocket.emit("send message", messageData);
      clientSocket2.once("hasNewMessage", (data) => {
        client2CallCount++;
        data.room.should.equal(roomId);
        data.author.should.equal(username);
        data.message.should.equal(currentMessage);
        data.time.should.equal(time);
      });
      clientSocket3.once("hasNewMessage", (data) => {
        client3CallCount++;
      });
      setTimeout(() => {
        // Only client2 should have received the notification
        client2CallCount.should.equal(1);
        client3CallCount.should.equal(0);
        done();
      }, 1000);
    });
  });
});
