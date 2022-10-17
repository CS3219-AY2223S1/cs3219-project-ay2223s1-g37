import QuestionModel from './question-model.js'
import { getQuestion } from '../repository.js';

export async function ormGetQuestion(difficulty, questionHistory) {
    try {
        const question = await getQuestion(difficulty, questionHistory);
        return question;
    } catch (err) {
        console.log('ERROR: Could not retrieve question');
        return { err };
    }
} 