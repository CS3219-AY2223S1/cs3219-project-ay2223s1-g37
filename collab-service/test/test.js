import { app } from "../index.js"
import chai from 'chai'
import chaiHttp from 'chai-http'
import { io } from 'socket.io-client'
import { Room } from "../index.js"

const assert = chai.assert;

chai.use(chaiHttp)
chai.should() // assertion lib

describe("Collaboration Service tests", () => {
  let clientSocket;
	let clientSocket2;

  beforeEach((done) => {
    clientSocket = io.connect('http://localhost:8002');
		clientSocket2 = io.connect('http://localhost:8002');
    clientSocket.on("connect", done);
  });

  afterEach(() => {
    Room.destroy({
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
        res.text.should.equal("Hello World from collaboration-service")
        done();
      });
    });
  });

  describe("Create room", () => {
    it("should add room into the database with the correct usernames and difficulty", (done) => {
      clientSocket.emit("createRoom", { username1: "user1", username2: "user2", difficulty: "Hard" });
      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        room.username1.should.equal("user1");
        room.username2.should.equal("user2");
        room.difficulty.should.equal("Hard");
        done();
      });
    });

    it("should not add room into the database if the usernames are missing", (done) => {
      clientSocket.emit("createRoom", { difficulty: "Hard" });
      clientSocket.on("roomCreationFailure", (resp) => {
        done();
      });
    });
  });

  describe("Switch roles", () => {
    it("should switch the roles of the interviewer and interviewee", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user3", username2: "user4", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
        clientSocket.emit("switchRoles", { roomId: roomId });

        clientSocket.on("switchedRolesSuccessful", (resp) => {
          done();
        });
      }, 1000);
    });
  });

  describe("Update room", () => {
    it("should increment the number of rounds for the room", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user5", username2: "user6", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
        clientSocket.emit("sessionEnded", { roomId: roomId });
        done();
      }, 1000);
    });

    it("should return session completed when number of rounds for the room is 4", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user7", username2: "user8", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
        clientSocket.emit("sessionEnded", { roomId: roomId });
				clientSocket.emit("sessionEnded", { roomId: roomId });
				clientSocket.emit("sessionEnded", { roomId: roomId });
				clientSocket.emit("sessionEnded", { roomId: roomId });

				setTimeout(() => {
					clientSocket.emit("sessionEnded", { roomId: roomId });

					clientSocket.on("sessionComplete", (resp) => {
						done();
					});
				}, 1000);
      }, 1000);
    });
  });

	describe("Session complete", () => {
    it("should delete the room", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user9", username2: "user10", difficulty: "Hard" });
			clientSocket2.emit("createRoom", { username1: "user9", username2: "user10", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
        clientSocket.emit("sessionComplete", { roomId: roomId });
				// clientSocket.emit("sessionComplete", { roomId: roomId });

				clientSocket2.on("oneUserLeft", (resp) => {
					done();
				});
      }, 1000);
    });
  });

	describe("Upload changes", () => {
    it("should sync the code changes in the room", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user11", username2: "user12", difficulty: "Hard" });
			clientSocket2.emit("createRoom", { username1: "user11", username2: "user12", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
        clientSocket.emit("uploadChanges", { roomId: roomId, docChanges: "abc" });
				// clientSocket.emit("uploadChanges", { roomId: roomId, docChanges: "abc" });

				clientSocket2.on("documentUpdated", (resp) => {
					const docChanges = resp;
					docChanges.should.equal("abc");
					done();
				});
      }, 1000);
    });
  });

	describe("Set question", () => {
    it("should set the question in the room", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user13", username2: "user14", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
				const question1 = {
					_id: "1",
					name: "question 1", 
					description: "question description",
					category: "algorithms",
					difficulty: "hard",
					url: "question url",
				};

        clientSocket.emit("setQuestion", { roomId: roomId, question: question1 });

				clientSocket.on("questionSet", (resp) => {
					const { question, questionHistory } = resp;
					assert.deepEqual(question, question1);
					questionHistory.should.equal("1,");
					done();
				});
      }, 1000);
    });

		it("should updated the question history in the room", (done) => {
      let roomId;

      clientSocket.emit("createRoom", { username1: "user13", username2: "user14", difficulty: "Hard" });

      clientSocket.on("roomCreationSuccess", (resp) => {
        const { room } = resp;
        roomId = room.id;
      });

      setTimeout(() => {
				const question1 = {
					_id: "1",
					name: "question 1", 
					description: "question description",
					category: "algorithms",
					difficulty: "hard",
					url: "question url",
				};
				const question2 = {
					_id: "2",
					name: "question 2", 
					description: "question description",
					category: "algorithms",
					difficulty: "hard",
					url: "question url",
				};

        clientSocket.emit("setQuestion", { roomId: roomId, question: question1 });

				clientSocket.on("questionSet", (resp) => {
					clientSocket.emit("sessionEnded", { roomId: roomId });
				});

				setTimeout(() => {
					clientSocket.emit("setQuestion", { roomId: roomId, question: question2 });
					
					clientSocket.on("questionSet", (resp) => {
						const { question, questionHistory } = resp;
						assert.deepEqual(question, question2);
						questionHistory.should.equal("1,2,");
						done();
					});
				}, 1000);
      }, 1000);
    });
  });
});