import mongoose from 'mongoose';
const {Schema, model} = mongoose

const productSizeSchema = Schema({
    
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    size: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Size'
    }, 
},{
    timestamps: true
})

export default model('ProductSize', productSizeSchema )