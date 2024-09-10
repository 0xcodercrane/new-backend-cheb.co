import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const addressStreetSchema = Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'City'
    },
    name: {
        type: String,
        required: true
    }
  
}, {
    timestamps: true
})

export default model('Street', addressStreetSchema);

