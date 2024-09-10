import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const sellerInviteSchema = Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Seller'
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    }
}, {
    timestamps: true
})

export default model('SellerInvite', sellerInviteSchema);