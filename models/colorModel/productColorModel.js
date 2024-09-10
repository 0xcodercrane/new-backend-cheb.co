import mongoose from 'mongoose';
const {Schema, model} = mongoose

const productColorSchema = Schema({
    
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    color: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Color'
    }
},{
    timestamps: true
})

export default model('ProductColor', productColorSchema )