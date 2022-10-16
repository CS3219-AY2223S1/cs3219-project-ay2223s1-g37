import { ormGetQuestion as _getQuestion } from '../model/question-orm.js'

export async function getQuestion(req, res) {
    try {
        const { difficulty, questionHistory } = req.body;
        if (difficulty && questionHistory) {
            const question = await _getQuestion(difficulty, questionHistory);
            if (!question.length) {
                return res.status(200).json({message: 'You have completed all questions of this difficulty!'})
            }
            return res.status(200).json({message: 'Question retrieved', question: question[0]});
        } else {
            return res.status(400).json({message: 'Difficulty and/or Question History are missing!'});
        }
    } catch {
        return res.status(500).json({message: 'Database failure when retrieving question from database!'})
    }
}