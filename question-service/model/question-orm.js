import QuestionModel from './question-model.js'

export async function ormGetQuestion(difficulty, questionHistory) {
    try {
        const question = await QuestionModel.aggregate([{"$match": {"difficulty": difficulty}},
                                                        {"$addFields": {"string_id": {"$toString": "$_id"}}}, 
                                                        {"$match": {"difficulty": difficulty, "string_id": {"$nin": questionHistory}}}, 
                                                        {"$sample": {"size": 1}}]);
        return question;
    } catch (err) {
        console.log('ERROR: Could not retrieve question');
        return { err };
    }
} 