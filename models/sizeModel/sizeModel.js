import mongoose from 'mongoose';
const { Schema, model } = mongoose

const sizeSchema = Schema({
    name: {
        type: String,
        required: [true, 'Please Add Name']
    },
    type: {
        type: String,
        enum: ["sneaker", "apparel"],
        required: [true, 'Please Add Type']
    },
    gender: {
        type: String,
        enum: ["men", "women"],
        required: [true, 'Please Add Gender']
    },
    precedence: {
        type: Number,
        required: [true, "Please Add Precedence"]
    },
    isArchive: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    })

export default model('Size', sizeSchema)