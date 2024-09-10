import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const discountSchema = Schema({
    amount: {
        type: Number,
        required: true,
        min: [0, "Amount must be between 0 and 100"],
        max: [100, "Amount must be between 0 and 100"]
    },
    
    isApplicable: {
        type: Boolean,
        required: true
    },
    

})

export default model('Discount', discountSchema)