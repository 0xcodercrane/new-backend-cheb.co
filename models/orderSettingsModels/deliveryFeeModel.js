import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const deliveryFeeSchema = Schema({
    name: {
        type: String,
        required: true,
        minLength: [3, "Names must be a minimum of 3 characters long"],
        maxLength: [30, "Names must be a maximum of 30 characters long"]
    },
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount must be more than or equal to 0"]
    },
    isApplicable: {
        type: Boolean,
        required: true
    },
    

})

export default model('DeliveryFee', deliveryFeeSchema)