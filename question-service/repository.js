import 'dotenv/config'
import QuestionModel from './model/question-model.js'

//Set up mongoose connection
import mongoose from 'mongoose';

let mongoDB = process.env.ENV == "PROD" ? process.env.DB_CLOUD_URI : process.env.DB_LOCAL_URI;

mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export async function getQuestion(difficulty, questionHistory) {
    try {
        const questions = await QuestionModel.find();
        const question = await QuestionModel.aggregate([{"$match": {"difficulty": difficulty}},
                                                        {"$addFields": {"string_id": {"$toString": "$_id"}}}, 
                                                        {"$match": {"difficulty": difficulty, "string_id": {"$ne": questionHistory._id}}}, 
                                                        {"$sample": {"size": 1}}]);
        return question;
    } catch (err) {
        console.log('ERROR: Could not retrieve question');
        return {err};
    }
}
