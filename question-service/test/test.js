import {app} from "../index.js"
import chaiHttp from 'chai-http'
import chai from 'chai'
import mongoose from "mongoose"


chai.use(chaiHttp)
chai.should()

describe('question-service tests', data => {

    before("test MongoDB", () => {
        mongoose.connect(process.env.DB_LOCAL_URI)
        const db = mongoose.connection
        db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
        db.once('open', function () {
            console.log('Connected to MongoDB')
        })
    })


    describe('GET', () => {
        it('should show hello world message', (done) => {
            chai.request(app)
                .get("/api/question")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.text.should.equal("Hello World from question-service")
                    done();
                })
        })
    })

    describe('POST /api/question', () => {

        it('should not get question with empty question history field', (done) => {
            chai.request(app)
                .post("/api/question")
                .set('content-type', 'application/json')
                .send({difficulty: "easy"})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Difficulty and/or Question History are missing!')
                    done()
                })
        })

        it('should not get question with empty difficulty field', (done) => {
            chai.request(app)
                .post("/api/question")
                .set('content-type', 'application/json')
                .send({questionHistory: []})
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.message.should.equal('Difficulty and/or Question History are missing!')
                    done()
                })
        })

        it('should get question', (done) => {
            chai.request(app)
                .post("/api/question")
                .set('content-type', 'application/json')
                .send({difficulty: "easy", questionHistory: []})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.message.should.equal('Question retrieved')
                    done()
                })
        })
    })

})