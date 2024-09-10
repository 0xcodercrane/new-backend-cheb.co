import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const addressStateSchema = Schema({
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model("State",addressStateSchema)