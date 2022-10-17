const URI_USER_SVC = process.env.URI_USER_SVC || 'http://localhost:8000'
const URI_QUESTION_SVC = process.env.URI_QUESTION_SVC || 'http://localhost:8003'

const PREFIX_USER_SVC = '/api/user'
export const PREFIX_CREATE_USER = '/signup'
const PREFIX_QUESTION_SVC = '/api/question'

export const URL_USER_SVC = URI_USER_SVC + PREFIX_USER_SVC
export const URL_QUESTION_SVC = URI_QUESTION_SVC + PREFIX_QUESTION_SVC
