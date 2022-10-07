import mongoose from 'mongoose';
var Schema = mongoose.Schema
let EmailTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "UserModel",
    },
    token: {
        type: String,
        required: true,
    },
})

export default mongoose.model('EmailTokenSchema', EmailTokenSchema)