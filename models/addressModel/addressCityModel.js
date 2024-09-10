import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const addressCitySchema = Schema({
    state: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'State'
    },
    name: {
        type: String,
        required: true
    }
  
}, {
    timestamps: true
})

export default model('City', addressCitySchema);

