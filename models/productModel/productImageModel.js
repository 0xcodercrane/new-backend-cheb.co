import mongoose from 'mongoose';
const {Schema, model} = mongoose

const productImageSchema = Schema({  
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    image:{
        type: String,
        required:true
    }
   
},{
    timestamps: true
})

export default model('ProductImage', productImageSchema )