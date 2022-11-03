import { app } from "../index.js"
import chai from 'chai'
import chaiHttp from 'chai-http'
const assert = chai.assert;
import { usersData } from "./test-data.js"
import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import UserModel from "../model/user-model.js";

chai.use(chaiHttp)
chai.should() // assertion lib

describe('user-service tests', data => {
    let token
    const password = "John@Smith123456"
    const newUser = new UserModel({
        username: "John Smith",
        password: password,
        email: "john.smith12345@u.nus.edu",
        verified: true
    })

    before("test MongoDB", () => {
        mongoose.connect(process.env.DB_LOCAL_URI)
        const db = mongoose.connection
        db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
        db.once('open', function () {
            console.log('Connected to MongoDB')
            // done()
        })
    })

    after("delete user", async () => {
        await UserModel.findOneAndRemove({username: usersData[1].username}).exec();
    })

    describe("setup", () => {
        it('create user setup', async () => {
            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(password, salt);
            await UserModel.create(newUser)
        })
    })

    describe('GET', () => {
        it('should show hello world message', (done) => {
            chai.request(app)
                .get("/api/user")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.equal("Hello World from user-service")
                    done();
                })
        })
    })

    describe('POST /api/user', () => {
        it('should not login if user is unknown', (done) => {
                chai.request(app)
                    .post("/api/user")
                    .set('content-type', 'application/json')
                    .send(usersData[1])
                    .end((err, res) => {
                        res.should.have.status(404)
                        res.body.message.should.equal(`Username: ${usersData[1].username} not found in database!`)
                        done()
                    })
            })

        it('should not login with empty fields', (done) => {
            chai.request(app)
                .post("/api/user")
                .set('content-type', 'application/json')
                .send({username: usersData[1].username})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Username and/or Password are missing!')
                    done()
                })
        })

        it('should not login with invalid username or password', (done) => {
            chai.request(app)
                .post("/api/user")
                .set('content-type', 'application/json')
                .send({username: newUser.username, password: "test1"})
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.message.should.equal('Incorrect username or password!')
                    done()
                })
        })

        it('should login user', (done) => {
            chai.request(app)
                .post("/api/user")
                .set('content-type', 'application/json')
                .send({username: newUser.username, password: password})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.equal('Authentication successful')
                    token = res.body.token
                    done()
                })
        })
    })

    describe('POST /api/user/signup', () => {
        it('should not create user with empty fields', (done) => {
            const userToBeCreated = {
                username: "",
                password: "John123456789@",
                email: "peer.prepTest@gmail.com",
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal("Email, Username and/or Password are missing!")
                    done()
                })
        })

        it('should not create user with invalid email', (done) => {
            const userToBeCreated = {
                username: "",
                password: "John123456789@",
                email: "peer.prepTest",
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Invalid Email Format!')
                    done()
                })
        })

        it('should not create a duplicate user', (done) => {
            const userToBeCreated = {
                username: "John Smith",
                password: "John123456789@",
                email: "peer.prepTest@gmail.com",
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.message.should.equal(`Username ${userToBeCreated.username} already exist!`)
                    done()
                })
        })

        it('should not create user if email already exist', (done) => {
            const userToBeCreated = {
                username: "test1",
                password: "John123456789@",
                email: newUser.email,
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(409)
                    res.body.message.should.equal('Email already exist!')
                    done()
                })
        })

        it('should not create user if password requirements are not met', (done) => {
            const userToBeCreated = {
                username: "test1",
                password: "test1",
                email: "peer.prepTest@gmail.com",
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Password does not meet requirements!')
                    done()
                })
        })

        it('should create a new user', (done) => {
            const userToBeCreated = {
                username: usersData[1].username,
                password: usersData[1].password,
                email: "peer.prepTest@gmail.com",
            }
            chai.request(app)
                .post("/api/user/signup")
                .set('content-type', 'application/json')
                .send(userToBeCreated)
                .end((err, res) => {
                    res.should.have.status(201)
                    res.body.message.should.equal(`Created new user ${userToBeCreated.username} successfully!`)
                    done()
                })
        })
    })

    describe('PUT /api/user', () => {
        it("should not change password with empty fields", (done) => {
            chai.request(app)
                .put("/api/user")
                .set('content-type', 'application/json')
                .send({username: newUser.username})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Username and/or Password are missing!')
                    done()
                })
        })

        it('should not change password if user is unknown', (done) => {
            chai.request(app)
                .put("/api/user")
                .set('content-type', 'application/json')
                .send({username: 'test2', oldPassword: newUser.password, newPassword: newUser.password})
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.equal(`Username: test2 not found in database!`)
                    done()
                })
        })

        it('should not change password with invalid password', (done) => {
            chai.request(app)
                .put("/api/user")
                .set('content-type', 'application/json')
                .send({username: newUser.username, oldPassword: 'test1', newPassword: newUser.password})
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.message.should.equal('Incorrect password! Unable to update account')
                    done()
                })
        })

        it('should change password', (done) => {
            chai.request(app)
                .put("/api/user")
                .set('content-type', 'application/json')
                .send({username: newUser.username, oldPassword: password, newPassword: password})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.equal('Password changed successfully!')
                    done()
                })
        })
    })

    describe('POST /api/user/reset', () => {
        it('should not reset password with invalid email', (done) => {
            chai.request(app)
                .post("/api/user/reset")
                .set('content-type', 'application/json')
                .send({email: 'peer.prepTest'})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal("Invalid Email Format!")
                    done()
                })
        })

        it('should not reset password with invalid email', (done) => {
            chai.request(app)
                .post("/api/user/reset")
                .set('content-type', 'application/json')
                .send({email: 'peer.prepTest1@gmail.com'})
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.equal('Email cannot be found in database!')
                    done()
                })
        })

        it('should reset password', (done) => {
            chai.request(app)
                .post("/api/user/reset")
                .set('content-type', 'application/json')
                .send({email: newUser.email})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.equal(`Successfully sent email`)
                    done()
                })
        })
    })

    describe('POST /api/user/auth', () => {
        it('should logout user', (done) => {
            chai.request(app)
                .post('/api/user/auth')
                .set('Cookie', `token=${token}`)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
        })
    })

    describe('DELETE /api/user', () => {
        before('login for DELETE api', (done) => {
            chai.request(app)
                .post('/api/user')
                .set('content-type', 'application/json')
                .send({username: newUser.username, password: password})
                .end(done)
        })

        it('should not delete user if user is unknown', (done) => {
            chai.request(app)
                .delete("/api/user")
                .set('content-type', 'application/json')
                .send({ username: 'test2', password: 'test2' })
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.equal(`Unable to find username test2 in database`)
                    done()
                })
        })

        it('should not delete user with empty fields', (done) => {
            chai.request(app)
                .delete("/api/user")
                .set('content-type', 'application/json')
                .send({ username: newUser.username })
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Username and/or Password are missing!')
                    done()
                })
        })

        it('should not delete user with invalid password', (done) => {
            chai.request(app)
                .delete("/api/user")
                .set('content-type', 'application/json')
                .send({ username: newUser.username, password: 'test1' })
                .end((err, res) => {
                    res.should.have.status(401)
                    res.body.message.should.equal('Incorrect password! Unable to delete account')
                    done()
                })
        })

        it('should delete user', (done) => {
            chai.request(app)
                .delete("/api/user")
                .set('content-type', 'application/json')
                .send({ username: newUser.username, password: password })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.equal(`Username ${newUser.username} successfully deleted`)
                    done()
                })
        })
    })
})
