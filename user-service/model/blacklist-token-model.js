import mongoose from 'mongoose';
var Schema = mongoose.Schema
let BlackListTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '180m',
        default: Date.now
    }
})

export default mongoose.model('BlackListTokenModel', BlackListTokenSchema)