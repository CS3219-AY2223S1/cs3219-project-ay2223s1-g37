import mongoose from 'mongoose';
var Schema = mongoose.Schema
let QuestionModelSchema = new Schema({
    name: {
        type: String,
        required: true
    }, 
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['easy', 'medium', 'hard']
    },
    url: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('QuestionModel', QuestionModelSchema)