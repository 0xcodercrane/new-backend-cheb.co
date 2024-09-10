import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const defaultAddressSchema = Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Address'
    }
})

export default model('DefaultAddress', defaultAddressSchema)