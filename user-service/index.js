import express from 'express';
import cors from 'cors';
import cookieparser from 'cookie-parser'

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieparser())
app.use(cors({ 
    origin: 'http://localhost:3000', 
    credentials: true
})) // config cors so that front-end can use
app.options('*', cors())

import { router } from './routes/routes.js'

app.use('/api/user', router).all((_, res) => {
    res.setHeader('content-type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
})

app.listen(8000, () => console.log('user-service listening on port 8000'));

export { app }