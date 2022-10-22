import { app } from "../index.js"
import chai, { should } from 'chai'
import chaiHttp from 'chai-http'
import { io } from 'socket.io-client'
import { sequelize, Match } from "../repository.js"

const assert = chai.assert;

chai.use(chaiHttp)
chai.should() // assertion lib

describe("Matching Service tests", () => {
  let clientSocket;

  beforeEach((done) => {
    clientSocket = io.connect('http://localhost:8001');
    clientSocket.on("connect", done);
  });

  afterEach(() => {
    Match.destroy({
      where: {},
      truncate: true
    });
  })

  after(() => {
    clientSocket.close();
  });
  
  describe("GET", () => {
    it("should show hello world message", (done) => {
    chai.request(app)
      .get("/")
      .end((err, res) => {
        res.should.have.status(200);
        res.text.should.equal("Hello World from matching-service")
        done();
      });
    });
  });

  describe("Create match", () => {
    it("should add matches into the database with the correct username and difficulty", (done) => {
      clientSocket.emit("match", { username1: "user1", difficulty: "Hard" });
      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId.should.equal(1);
        done();
      });
    });

    it("should not add match into the database if the username is missing", (done) => {
      clientSocket.emit("match", { difficulty: "Hard" });
      clientSocket.on("matchCreationFailure", (resp) => {
        done();
      });
    });
  });

  describe("Pair matches", () => {
    it("should pair 2 matches with the same difficulty", (done) => {

      let matchEntryId1;
      let matchEntryId2;

      clientSocket.emit("match", { username1: "user3", difficulty: "Hard" });
      clientSocket.emit("match", { username1: "user4", difficulty: "Hard" });

      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId1 = matchEntryId;
      })
      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId2 = matchEntryId;
      });

      setTimeout(() => {
        clientSocket.emit("pairing", { matchEntryId: matchEntryId1, timeLeft: 30 });

        clientSocket.on("pairingSuccess", (resp) => {
          const { matchEntryId } = resp;
          matchEntryId.username1.should.equal("user4");
          matchEntryId.username2.should.equal("user3");
          matchEntryId.difficulty.should.equal("Hard");
          done();
        });
      }, 1000);
    });

    it("should not pair 2 matches with different difficulties", (done) => {
      let matchEntryId1;
      let matchEntryId2;

      clientSocket.emit("match", { username1: "user5", difficulty: "Hard" });
      clientSocket.emit("match", { username1: "user6", difficulty: "Easy" });

      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId1 = matchEntryId;
      })
      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId2 = matchEntryId;
      });

      setTimeout(() => {
        let respVar;

        clientSocket.emit("pairing", { matchEntryId: matchEntryId1, timeLeft: 30 });
        clientSocket.on("pairingSuccess", (resp) => {
          respVar = resp;
        });

        setTimeout(() => {
          assert.equal(respVar, undefined);
          done();
        }, 2000);
      }, 1000);
    });

    it("should return pairing failure if no match is found and timeLeft is 0", (done) => {
      let matchEntryId1;

      clientSocket.emit("match", { username1: "user7", difficulty: "Hard" });

      clientSocket.on("matchCreationSuccess", (resp) => {
        const { matchEntryId } = resp;
        matchEntryId1 = matchEntryId;
      })

      setTimeout(() => {
        clientSocket.emit("pairing", { matchEntryId: matchEntryId1, timeLeft: 0 });
        clientSocket.on("pairingFailed", (resp) => {
          done();
        });
      }, 1000);
    });
  });
});