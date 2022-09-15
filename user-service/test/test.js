import { app } from "../index.js"
import chai from 'chai'
import chaiHttp from 'chai-http'
const assert = chai.assert;
import { usersData } from "./test-data.js"

chai.use(chaiHttp)
chai.should() // assertion lib

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