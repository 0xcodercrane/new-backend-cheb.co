import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const orderStatusSchema = Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    },
    status: {
        type: String,
        enum: ['pending', 'complete', 'delivered'],
        // required: [true, 'Please add a Status']
    },
}, {
    timestamps: true
})

export default model('OrderStatus', orderStatusSchema)