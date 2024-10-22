import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const customerSchema = Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    mobile: {
        type: Number,
        unique: true,
       
    },
    dp: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    dob: {
        type: Date
    },
    otp :{
        type : String,
        default : null
    },
    isOtpVerified:{
        type : Boolean,
        default : false
    },
    isVerified : {
        type : Boolean,
        default : false
    },
}, {
    timestamps: true
})

export default model('Customer', customerSchema);