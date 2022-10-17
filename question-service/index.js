import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true
})) // config cors so that front-end can use
app.options('*', cors())

import { router } from './routes/routes.js'

app.use('/api/question', router).all((_, res) => {
    res.setHeader('content-type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
})

app.listen(8003, () => console.log('question-service listening on port 8003'));

export { app }